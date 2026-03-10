import { BadRequestException } from '@nestjs/common';
import { PaginationOptions } from './pagination-options';

describe('PaginationOptions', () => {
  describe('resolve', () => {
    it('debería retornar valores por defecto cuando el objeto de parámetros está vacío', () => {
      const result = PaginationOptions.resolve({});
      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        skip: 0,
        take: 10,
      });
    });

    it('debería calcular correctamente el skip para páginas superiores', () => {
      const result = PaginationOptions.resolve({ page: 3, pageSize: 5 });
      expect(result.skip).toBe(10);
      expect(result.take).toBe(5);
    });

    it('debería lanzar BadRequestException si la página es menor a 1', () => {
      expect(() => PaginationOptions.resolve({ page: 0 })).toThrow(
        BadRequestException,
      );
      expect(() => PaginationOptions.resolve({ page: -5 })).toThrow(
        'Page must be greater than or equal to 1',
      );
    });

    it('debería lanzar BadRequestException si el pageSize es menor a 1', () => {
      expect(() => PaginationOptions.resolve({ pageSize: 0 })).toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si el pageSize supera el máximo de 50', () => {
      expect(() => PaginationOptions.resolve({ pageSize: 51 })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('buildMeta', () => {
    it('debería construir el objeto meta correctamente', () => {
      const total = 100;
      const page = 1;
      const pageSize = 10;

      const result = PaginationOptions.buildMeta(total, page, pageSize);

      expect(result).toEqual({
        total: 100,
        page: 1,
        pageSize: 10,
        totalPages: 10,
      });
    });

    it('debería calcular correctamente las páginas totales con números impares', () => {
      const result = PaginationOptions.buildMeta(25, 1, 10);
      expect(result.totalPages).toBe(3);
    });

    it('debería retornar 0 páginas totales si el total de items es 0', () => {
      const result = PaginationOptions.buildMeta(0, 1, 10);
      expect(result.totalPages).toBe(0);
    });
  });
});
