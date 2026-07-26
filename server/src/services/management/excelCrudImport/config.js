// @ts-nocheck
import { moduleConfigs } from './modules.js';

export const getExcelCrudModuleConfig = (moduleKey) => {
  const config = moduleConfigs[moduleKey];
  if (!config) {
    throw new Error(`Không tìm th\u1ea5y c\u1ea5u h\u00ecnh import Excel cho module "${moduleKey}".`);
  }
  return config;
};

export const listExcelCrudModules = () => Object.keys(moduleConfigs);
