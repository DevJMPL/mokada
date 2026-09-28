import type { FiscalPersonType } from '../modules/customers/services/customers.service';

export interface FiscalRegimeOption {
  value: string;
  label: string;
  personTypes: FiscalPersonType[];
}

export interface CfdiUseOption {
  value: string;
  label: string;
  personTypes: FiscalPersonType[];
  regimes: string[];
}

export const fiscalRegimeOptions: FiscalRegimeOption[] = [
  { value: '601', label: '601 - GENERAL DE LEY PERSONAS MORALES', personTypes: ['LEGAL_ENTITY'] },
  { value: '603', label: '603 - PERSONAS MORALES CON FINES NO LUCRATIVOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '605', label: '605 - SUELDOS Y SALARIOS E INGRESOS ASIMILADOS A SALARIOS', personTypes: ['INDIVIDUAL'] },
  { value: '606', label: '606 - ARRENDAMIENTO', personTypes: ['INDIVIDUAL'] },
  { value: '607', label: '607 - RÉGIMEN DE ENAJENACIÓN O ADQUISICIÓN DE BIENES', personTypes: ['INDIVIDUAL'] },
  { value: '608', label: '608 - DEMÁS INGRESOS', personTypes: ['INDIVIDUAL'] },
  { value: '610', label: '610 - RESIDENTES EN EL EXTRANJERO SIN ESTABLECIMIENTO PERMANENTE EN MÉXICO', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'] },
  { value: '611', label: '611 - INGRESOS POR DIVIDENDOS', personTypes: ['INDIVIDUAL'] },
  { value: '612', label: '612 - PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES', personTypes: ['INDIVIDUAL'] },
  { value: '614', label: '614 - INGRESOS POR INTERESES', personTypes: ['INDIVIDUAL'] },
  { value: '615', label: '615 - RÉGIMEN DE LOS INGRESOS POR OBTENCIÓN DE PREMIOS', personTypes: ['INDIVIDUAL'] },
  { value: '616', label: '616 - SIN OBLIGACIONES FISCALES', personTypes: ['INDIVIDUAL'] },
  { value: '620', label: '620 - SOCIEDADES COOPERATIVAS DE PRODUCCIÓN QUE OPTAN POR DIFERIR SUS INGRESOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '621', label: '621 - INCORPORACIÓN FISCAL', personTypes: ['INDIVIDUAL'] },
  { value: '622', label: '622 - ACTIVIDADES AGRÍCOLAS, GANADERAS, SILVÍCOLAS Y PESQUERAS', personTypes: ['LEGAL_ENTITY'] },
  { value: '623', label: '623 - OPCIONAL PARA GRUPOS DE SOCIEDADES', personTypes: ['LEGAL_ENTITY'] },
  { value: '624', label: '624 - COORDINADOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '625', label: '625 - RÉGIMEN DE LAS ACTIVIDADES EMPRESARIALES CON INGRESOS A TRAVÉS DE PLATAFORMAS TECNOLÓGICAS', personTypes: ['INDIVIDUAL'] },
  { value: '626', label: '626 - RÉGIMEN SIMPLIFICADO DE CONFIANZA', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'] },
];

export const cfdiUseOptions: CfdiUseOption[] = [
  { value: 'G01', label: 'G01 - ADQUISICIÓN DE MERCANCÍAS', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'G02', label: 'G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '616', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'G03', label: 'G03 - GASTOS EN GENERAL', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I01', label: 'I01 - CONSTRUCCIONES', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I02', label: 'I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I03', label: 'I03 - EQUIPO DE TRANSPORTE', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I04', label: 'I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I05', label: 'I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I06', label: 'I06 - COMUNICACIONES TELEFÓNICAS', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I07', label: 'I07 - COMUNICACIONES SATELITALES', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'I08', label: 'I08 - OTRA MAQUINARIA Y EQUIPO', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '606', '612', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'D01', label: 'D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D02', label: 'D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D03', label: 'D03 - GASTOS FUNERALES', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D04', label: 'D04 - DONATIVOS', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D05', label: 'D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D06', label: 'D06 - APORTACIONES VOLUNTARIAS AL SAR', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D07', label: 'D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D08', label: 'D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D09', label: 'D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'D10', label: 'D10 - PAGOS POR SERVICIOS EDUCATIVOS', personTypes: ['INDIVIDUAL'], regimes: ['605', '606', '608', '611', '612', '614', '607', '615', '625', '626'] },
  { value: 'S01', label: 'S01 - SIN EFECTOS FISCALES', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '605', '606', '607', '608', '610', '611', '612', '614', '615', '616', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'CP01', label: 'CP01 - PAGOS', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'], regimes: ['601', '603', '605', '606', '607', '608', '610', '611', '612', '614', '615', '616', '620', '621', '622', '623', '624', '625', '626'] },
  { value: 'CN01', label: 'CN01 - NÓMINA', personTypes: ['INDIVIDUAL'], regimes: ['605'] },
];
