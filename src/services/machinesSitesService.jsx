// src/Services/machinesSitesService.js
// ✅ TEMPORAL - Usando datos mock para evitar errores de JSON

import axios from 'axios';

const API_BASE_URL = 'https://logintec-1.onrender.com';

class MachinesSitesService {
  
  /**
   * Obtiene información de la máquina de este sitio
   */
  static getCurrentMachine() {
    return null; // No longer using mockConfigData
  }

  /**
   * Obtiene información del sitio actual
   */
  static getCurrentSite() {
    return null; // No longer using mockConfigData
  }

  /**
   * Obtiene información del cliente
   */
  static getClientInfo() {
    return null; // No longer using mockConfigData
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
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos?page=1&page_size=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const items = response.data.items || [];
      if (items.length === 0) return null;
      const escaneo = items[0];
      return {
        machine: {
          serial_number: escaneo.maquina_serial,
          modelo: escaneo.maquina_modelo,
          ip_address: escaneo.maquina_ip,
          mac_address: escaneo.maquina_mac,
          firmware_version: escaneo.maquina_firmware,
          ultima_medicion: escaneo.maquina_ultima_medicion,
          ultima_medicion_legible: escaneo.maquina_ultima_medicion_legible,
          enabled: true // o el campo que corresponda
        },
        site: {
          nombre: escaneo.site_name,
          tipo: escaneo.tipo_sitio,
          ubicacion: escaneo.device_location,
          estado: escaneo.estado_sitio,
          ultima_conexion: escaneo.ultima_conexion,
          ultima_conexion_legible: escaneo.ultima_conexion_legible
        },
        client: escaneo.client || {},
        isConnected: true // o lógica según los campos
      };
    } catch (error) {
      console.error('Error obteniendo datos de máquina y sitio:', error);
      return null;
    }
  }
}

export default MachinesSitesService;