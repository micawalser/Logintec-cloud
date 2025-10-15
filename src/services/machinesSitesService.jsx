// src/Services/machinesSitesService.js
// ✅ ACTUALIZADO - Usando endpoints de PostgreSQL para sitios y máquinas

import axios from 'axios';
import { formatDateArgentina } from '../utils/dateUtils';
import ApiService from '../apiService';

const API_BASE_URL = 'https://logintec-1.onrender.com';
// El cliente_id se obtiene automáticamente del token JWT en el backend

class MachinesSitesService {
  
  /**
   * 🆕 Obtiene información de la máquina desde PostgreSQL
   */
  static getCurrentMachine() {
    // Ya no se usa - se obtiene desde PostgreSQL
    return null;
  }

  /**
   * 🆕 Obtiene información del sitio desde PostgreSQL
   */
  static getCurrentSite() {
    // Ya no se usa - se obtiene desde PostgreSQL
    return null;
  }

  /**
   * Obtiene información del cliente
   */
  static getClientInfo() {
    return null;
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
   * ✅ ACTUALIZADO: Enriquece escaneos con datos de máquina/sitio desde PostgreSQL JOIN
   */
  static enrichScanWithMachineData(scan) {
    return {
      ...scan,
      // ✅ Usar datos del JOIN con sitios y máquinas
      machine_name: scan.maquina?.nombre || scan.machine_nombre || scan.maquina_modelo || 'Máquina Desconocida',
      machine_id: scan.machine_id || 'N/A',
      machine_model: scan.maquina?.modelo || scan.machine_modelo || scan.maquina_modelo || 'N/A',
      machine_descripcion: scan.machine_descripcion || 'N/A',
      site_name: scan.sitio?.nombre || scan.site_name || 'Sitio Desconocido',
      site_type: scan.site_type || scan.tipo_sitio || 'N/A',
      site_location: scan.sitio?.ubicacion || scan.device_location || scan.site_location || 'Ubicación Desconocida'
    };
  }

  /**
   * Formatea fecha en formato argentino con zona horaria específica
   */
  static formatDate(dateString) {
    return formatDateArgentina(dateString);
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

  /**
   * 🔧 Obtiene todas las máquinas desde el backend
   */
  static async getAllMachines() {
    try {
      console.log('🔧 Obteniendo máquinas desde PostgreSQL...');
      const response = await ApiService.getMaquinas();
      
      // Mapear respuesta del backend al formato esperado por el frontend
      const maquinas = response.maquinas.map(maquina => ({
        id: maquina.id,
        nombre: maquina.nombre,
        modelo: maquina.modelo,
        fabricante: 'AGH', // Valor por defecto
        descripcion: maquina.descripcion || '',
        ip: '', // No disponible en el backend actual
        mac: '', // No disponible en el backend actual
        firmware: '', // No disponible en el backend actual
        ultima_medicion: null // No disponible en el backend actual
      }));
      
      console.log(`✅ Obtenidas ${maquinas.length} máquinas desde PostgreSQL`);
      return maquinas;
    } catch (error) {
      console.error('❌ Error obteniendo máquinas desde PostgreSQL:', error);
      console.log('⚠️ Usando fallback: obteniendo máquinas desde escaneos...');
      return this.getAllMachinesFromScans();
    }
  }

  /**
   * 🔄 FALLBACK: Obtiene máquinas desde escaneos (método anterior)
   */
  static async getAllMachinesFromScans() {
    try {
      console.log('⚠️ Usando fallback: obteniendo máquinas desde escaneos...');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('⚠️ No hay token, usando datos mock temporales');
        return this.getMockMachines();
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos?page=1&page_size=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const items = response.data.items || [];
      const maquinasMap = {};
      
      items.forEach(e => {
        const key = e.machine_id;
        if (key && !maquinasMap[key]) {
          maquinasMap[key] = {
            id: key,
            nombre: e.maquina?.nombre || 'Máquina Desconocida',
            modelo: e.maquina?.modelo || 'N/A',
            enabled: true
          };
        }
      });
      
      return Object.values(maquinasMap);
    } catch (error) {
      console.error('❌ Error en fallback de máquinas:', error);
      console.log('⚠️ Usando datos mock como último recurso');
      return this.getMockMachines();
    }
  }

  /**
   * 🏢 Obtiene todos los sitios desde el backend
   */
  static async getAllSites() {
    try {
      console.log('🏢 Obteniendo sitios desde PostgreSQL...');
      const response = await ApiService.getSitios();
      
      // Mapear respuesta del backend al formato esperado por el frontend
      const sitios = response.sitios.map(sitio => ({
        id: sitio.id,
        nombre: sitio.nombre_sitio,
        ubicacion: sitio.ubicacion || '',
        tipo: 'PC', // Valor por defecto
        ultima_conexion: sitio.ultimo_escaneo || null,
        total_escaneos: sitio.total_escaneos || 0,
        maquina: {
          id: null, // No disponible en el endpoint actual
          nombre: 'Máquina Asignada',
          modelo: 'N/A'
        }
      }));
      
      console.log(`✅ Obtenidos ${sitios.length} sitios desde PostgreSQL`);
      return sitios;
    } catch (error) {
      console.error('❌ Error obteniendo sitios desde PostgreSQL:', error);
      console.log('⚠️ Usando fallback: obteniendo sitios desde escaneos...');
      return this.getAllSitesFromScans();
    }
  }

  /**
   * 🔄 FALLBACK: Obtiene sitios desde escaneos (método anterior)
   */
  static async getAllSitesFromScans() {
    try {
      console.log('⚠️ Usando fallback: obteniendo sitios desde escaneos...');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('⚠️ No hay token, usando datos mock temporales');
        return this.getMockSites();
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/cloud/escaneos?page=1&page_size=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const items = response.data.items || [];
      const sitiosMap = {};
      
      items.forEach(e => {
        const key = e.site_id;
        if (key && !sitiosMap[key]) {
          sitiosMap[key] = {
            id: key,
            nombre: e.sitio?.nombre || 'Sitio Desconocido',
            ubicacion: e.sitio?.ubicacion || 'Ubicación Desconocida',
            tipo: 'PC',
            estado: 'activo',
            ultima_conexion: e.fecha
          };
        }
      });
      
      return Object.values(sitiosMap);
    } catch (error) {
      console.error('❌ Error en fallback de sitios:', error);
      console.log('⚠️ Usando datos mock como último recurso');
      return this.getMockSites();
    }
  }

  /**
   * 🔧 DATOS MOCK TEMPORALES para cuando no hay conexión
   */
  static getMockMachines() {
    console.log('🔧 Usando datos mock de máquinas');
    return [
      {
        id: 'mock_machine_1',
        nombre: 'LS1000 Principal',
        modelo: 'LS1000-Pro',
        descripcion: 'Escáner LIDAR principal',
        fabricante: 'AGH',
        firmware: 'v2.1.3',
        ip: '192.168.0.100',
        mac: 'AA:BB:CC:DD:EE:FF',
        ultima_medicion: new Date().toISOString(),
        enabled: true
      },
      {
        id: 'mock_machine_2',
        nombre: 'Conlida CLD8000',
        modelo: 'CLD-8000',
        descripcion: 'Máquina de medición Conlida',
        fabricante: 'Conlida',
        firmware: 'v1.0.0',
        ip: '192.168.0.101',
        mac: 'BB:CC:DD:EE:FF:AA',
        ultima_medicion: new Date().toISOString(),
        enabled: true
      }
    ];
  }

  static getMockSites() {
    console.log('🏢 Usando datos mock de sitios');
    return [
      {
        id: 'mock_site_1',
        nombre: 'PC San Martín',
        ubicacion: 'Oficina San Martín - Buenos Aires',
        tipo: 'PC',
        estado: 'activo',
        ultima_conexion: new Date().toISOString(),
        total_escaneos: 1500,
        maquina: {
          idmachine: 1,
          nombre: 'LS1000 Principal',
          modelo: 'LS1000-Pro'
        }
      },
      {
        id: 'mock_site_2',
        nombre: 'Depósito Central',
        ubicacion: 'Depósito - Buenos Aires',
        tipo: 'Depósito',
        estado: 'activo',
        ultima_conexion: new Date().toISOString(),
        total_escaneos: 850,
        maquina: {
          idmachine: 2,
          nombre: 'Conlida CLD8000',
          modelo: 'CLD-8000'
        }
      }
    ];
  }
}

export default MachinesSitesService;