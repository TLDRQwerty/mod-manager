import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInvokeMutation } from "~/utils";
import * as z from "zod";
import Dialog from "./ui/Dialog";
import Form from "./ui/Form";
import Field from "./ui/Field";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface Props {
  modId: string;
}

const fetchModDetailsSchema = z.object({
  modId: z.string(),
});

export default function FetchModDetails({ modId }: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fetchModDetailsSchema),
  });

  const downloadModDetails = useInvokeMutation("download_mod_details");

  const onSubmit = handleSubmit((data) => {
    downloadModDetails.mutate({
      modId: Number(modId),
      nexusModId: Number(data.modId),
    });
    setOpen(false);
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Dialog.Title>Fetch Mod Details</Dialog.Title>
        <div>
          <Form onSubmit={onSubmit}>
            <Field
              label="Nexus Mod ID"
              id="modId"
              error={errors.modId?.message}
            >
              <Input {...register("modId")} />
            </Field>
            <div className="flex flex-1 flex-row justify-between px-4 pt-4">
              <Button
                intent="secondary"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Fetch</Button>
            </div>
          </Form>
        </div>
      </Dialog>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Fetch Mod Details
      </Button>
    </>
  );
}
