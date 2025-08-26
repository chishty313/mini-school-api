import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Generic validation middleware
 */
export function validateDto<T extends object>(DtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Transform plain object to DTO class instance
      const dto = plainToClass(DtoClass, req.body);
      
      // Validate the DTO
      const errors: ValidationError[] = await validate(dto);

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          errors: error.constraints ? Object.values(error.constraints) : [],
        }));

        res.status(400).json({
          error: 'Validation failed',
          message: 'Please check the provided data',
          details: formattedErrors,
        });
        return;
      }

      // Add validated DTO to request object
      req.body = dto;
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Validation error',
        message: 'Something went wrong during validation',
      });
    }
  };
}

/**
 * Validate request body and handle errors
 */
export const validateBody = <T extends object>(DtoClass: new () => T) => {
  return validateDto(DtoClass);
};