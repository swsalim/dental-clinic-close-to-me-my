'use client';

import { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { Row } from '@tanstack/react-table';
import { MenuIcon } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { getCloudinaryPublicId } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/components/ui/use-toast';

import { ClinicTableData } from '../columns';

// import { taskSchema } from '../data/schema';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends ClinicTableData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const clinic = row.original;
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isToBeReviewed = pathname?.includes('/review');

  const onDeleteListing = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      const tableName = 'clinics';
      const { error } = await supabase.from(tableName).delete().match({ id: clinic.id });

      if (error) throw error;

      // Only delete images after successful clinic deletion
      if (clinic.images && clinic.images.length > 0) {
        for (const image of clinic.images) {
          try {
            // Extract fileId from ImageKit URL
            const public_id = getCloudinaryPublicId(image);
            if (public_id) {
              const response = await fetch('/api/delete-image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  public_id,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                console.error('Delete image error:', error);
                throw new Error(error.error || 'Failed to delete image');
              }
            }
          } catch (error) {
            console.error('Error deleting image:', error);
            // Continue with other images even if one fails
          }
        }
      }

      toast({
        title: 'You have deleted the listing successfully',
      });
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error instanceof Error ? error.message : 'Failed to delete listing',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const handleToggleActive = async () => {
    if (isToggling) return;

    try {
      setIsToggling(true);
      const tableName = 'clinics';
      const { error } = await supabase
        .from(tableName)
        .update({
          is_active: !clinic.is_active,
        })
        .eq('id', clinic.id);

      if (error) throw error;

      toast({
        title: `Clinic ${!clinic.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      router.refresh();
    } catch (error) {
      console.error('Error toggling active state:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to update active state',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium text-gray-900">"{clinic.name}"</span> from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" onClick={onDeleteListing} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Listing'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 justify-center p-0 data-[state=open]:bg-gray-100">
            <MenuIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {isToBeReviewed ? (
            <DropdownMenuItem
              onSelect={() => {
                router.push(`/dashboard/clinics/review/edit/${clinic.id}`);
              }}
              className="w-full cursor-pointer">
              Review
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => {
                router.push(`/dashboard/clinics/edit/${clinic.id}`);
              }}
              className="w-full cursor-pointer">
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleToggleActive} disabled={isToggling}>
            {isToggling ? 'Updating...' : `${clinic.is_active ? 'Deactivate' : 'Activate'}`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger>Delete</AlertDialogTrigger>
            </AlertDialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
