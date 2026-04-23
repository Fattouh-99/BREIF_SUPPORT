'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AppDrawer from '@/components/drawer';
import FormGenerator from '@/components/forms/form-generator';
import UploadButton from '@/components/upload-button';
import { Loader } from '@/components/loader';
import { useDomain } from '@/hooks/sidebar/use-domain';

export const CreateDomainButton = () => {
  const { register, onAddDomain, loading, errors } = useDomain();

  return (
    <AppDrawer
      description="add in your domain address to integrate your chatbot"
      title="Add your business domain"
      onOpen={
        <Button 
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Domain
        </Button>
      }
    >
      <Loader loading={loading}>
        <form
          className="mt-3 w-6/12 flex flex-col gap-3"
          onSubmit={onAddDomain}
        >
          <FormGenerator
            inputType="input"
            register={register}
            label="Domain"
            name="domain"
            errors={errors}
            placeholder="mydomain.com"
            type="text"
          />
          <UploadButton
            register={register}
            label="Upload Icon"
            errors={errors}
          />
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add Domain
          </Button>
        </form>
      </Loader>
    </AppDrawer>
  );
}; 