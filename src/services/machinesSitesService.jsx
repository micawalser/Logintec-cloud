// src/Services/machinesSitesService.js
// ✅ TEMPORAL - Usando datos mock para evitar errores de JSON

const mockConfigData = {
  client: {
    client_id: "CLIENTE_001",
    nombre: "EMPRESA_PRUEBA",
    descripcion: "Cliente de prueba para LS1000"
  },
  machine: {
    id: "MAQUINA_001",
    nombre: "LS1000 Principal",
    descripcion: "Máquina principal oficina central San Martín",
    mac_address: "AA:BB:CC:DD:EE:FF",
    serial_number: "LS1000-2025-001",
    ip_address: "192.168.0.100",
    modelo: "LS1000-Pro",
    ultima_medicion: null,
    firmware_version: "v2.1.3",
    enabled: true
  },
  site: {
    id: "SITIO_001",
    nombre: "PC San Martín",
    tipo: "PC",
    ubicacion: "Oficina San Martín - Buenos Aires",
    machine_id: "MAQUINA_001",
    ultima_conexion: "2025-06-27T09:15:00",
    estado: "activo"
  }
};

class MachinesSitesService {
  
  /**
   * Obtiene información de la máquina de este sitio
   */
  static getCurrentMachine() {
    return mockConfigData.machine || null;
  }

  /**
   * Obtiene información del sitio actual
   */
  static getCurrentSite() {
    return mockConfigData.site || null;
  }

  /**
   * Obtiene información del cliente
   */
  static getClientInfo() {
    return mockConfigData.client || {};
  }

  /**
   * ✅ NUEVO: Obtiene la última medición real desde los escaneos
   */
  static async getLastMeasurement() {
    try {
      const response = await fetch('https://logintec-1.onrender.com/api/cloud/escaneos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const escaneos = await response.json();
        
        // Buscar el último escaneo (el más reciente)
        if (escaneos && escaneos.length > 0) {
          const lastScan = escaneos
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
          
          return lastScan.fecha;
        }
      }
    } catch (error) {
      console.error('Error obteniendo última medición:', error);
    }
    
    // Si no hay escaneos, devolver null
    return null;
  }

  /**
   * ✅ NUEVO: Verifica el estado real de conexión
   */
  static async checkRealConnectionStatus() {
    const machine = this.getCurrentMachine();
    const site = this.getCurrentSite();
    
    // Estado básico del config
    const basicStatus = machine?.enabled && site?.estado === 'activo';
    
    return {
      isConnected: basicStatus,
      machineEnabled: machine?.enabled || false,
      siteActive: site?.estado === 'activo',
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * ✅ NUEVO: Enriquece escaneos con datos de máquina/sitio
   */
  static enrichScanWithMachineData(scan) {
    const machine = this.getCurrentMachine();
    const site = this.getCurrentSite();
    
    return {
      ...scan,
      // Agregar datos de máquina y sitio
      machine_name: machine?.nombre || 'Máquina Desconocida',
      machine_model: machine?.modelo || 'N/A',
      site_name: site?.nombre || 'Sitio Desconocido',
      site_type: site?.tipo || 'N/A',
      site_location: site?.ubicacion || 'N/A'
    };
  }

  /**
   * Formatea fecha en formato argentino
   */
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene icono para tipo de sitio (Material-UI)
   */
  static getSiteTypeIcon(tipo) {
    const icons = {
      'PC': 'Computer',
      'Notebook': 'LaptopMac', 
      'Móvil': 'Smartphone'
    };
    return icons[tipo] || 'Computer';
  }

  /**
   * ✅ MEJORADO: Obtiene información completa del sitio actual
   */
  static async getSiteInfo() {
    const machine = this.getCurrentMachine();
    const site = this.getCurrentSite();
    const connectionStatus = await this.checkRealConnectionStatus();
    const lastMeasurement = await this.getLastMeasurement();
    
    return {
      machine: {
        ...machine,
        ultima_medicion: lastMeasurement // ✅ Dato real, no estático
      },
      site,
      client: this.getClientInfo(),
      connectionStatus,
      isConnected: connectionStatus.isConnected
    };
  }
}

export default MachinesSitesService;