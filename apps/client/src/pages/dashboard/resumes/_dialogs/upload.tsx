import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { UploadSimple } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { uploadResume } from "@/client/services/resume/upload";
import { useDialog } from "@/client/stores/dialog";

const formSchema = z.object({
  file: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const UploadDialog = () => {
  const { toast } = useToast();
  const { isOpen, close } = useDialog("upload");
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) form.reset();
  }, [isOpen]);

  const onUpload = async () => {
    try {
      const values = form.getValues();
      console.log(values);
      if (!values.file) {
        throw new Error(t`Please select a file to upload.`);
      }
      // Placeholder for the upload logic, replace with your actual upload function
      await uploadResume(values.file);
      toast({
        variant: "success",
        title: t`Resume uploaded successfully.`,
      });
      close();
    } catch (error) {
      if (error instanceof ZodError) {
        toast({
          variant: "error",
          title: t`An error occurred while uploading the file.`,
        });
      } else {
        toast({
          variant: "error",
          title: t`An unexpected error occurred.` + error,
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <UploadSimple />
                  <h2>{t`Upload a new resume`}</h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {t`Select and upload your resume in PDF, DOC, or DOCX format.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="file"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Resume File`}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => {
                        if (!event.target.files || event.target.files.length === 0) {
                          field.onChange(undefined);
                        } else {
                          field.onChange(event.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" onClick={onUpload}>
                {t`Upload`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
