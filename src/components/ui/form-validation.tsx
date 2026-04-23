'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, description, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <label 
          htmlFor={props.id || props.name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          className={cn(
            "px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
            error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${props.id || props.name}-error` : 
            description ? `${props.id || props.name}-description` : undefined
          }
          {...props}
        />
        {description && !error && (
          <p 
            id={`${props.id || props.name}-description`}
            className="text-sm text-gray-500"
          >
            {description}
          </p>
        )}
        {error && (
          <div className="flex items-start mt-1">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1.5 flex-shrink-0" />
            <p
              id={`${props.id || props.name}-error`}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, description, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <label 
          htmlFor={props.id || props.name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "px-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm",
            "focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
            error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${props.id || props.name}-error` : 
            description ? `${props.id || props.name}-description` : undefined
          }
          {...props}
        />
        {description && !error && (
          <p 
            id={`${props.id || props.name}-description`}
            className="text-sm text-gray-500"
          >
            {description}
          </p>
        )}
        {error && (
          <div className="flex items-start mt-1">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-1.5 flex-shrink-0" />
            <p
              id={`${props.id || props.name}-error`}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField'; 