import { Link, Outlet, RootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TbHome, TbSettings } from "react-icons/tb";
import Button from "~/ui/Button";
import Dialog from "~/ui/Dialog";
import Field from "~/ui/Field";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Input from "~/ui/Input";
import Form from "~/ui/Form";
import { CONFIG_KEYS, useInvokeMutation, useInvokeQuery } from "~/utils";

const settingsSchema = z.object({
  nexusApiKey: z.string(),
});

function Root(): JSX.Element {
  const { data } = useInvokeQuery<{ key: string; value: string }>(
    "find_config",
    {
      key: CONFIG_KEYS.NEXUS_API_KEY,
    }
  );

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(settingsSchema),
  });

  const [showDialog, setShowDialog] = useState(false);

  const updateSettings = useInvokeMutation("create_update_config");

  const onSubmit = handleSubmit((data) => {
    updateSettings.mutate({
      key: CONFIG_KEYS.NEXUS_API_KEY,
      value: data.nexusApiKey,
    });
    setShowDialog(false);
  });

  return (
    <>
      <div>
        <Link to="/">
          <TbHome />
        </Link>
        <button
          onClick={() => {
            setShowDialog(true);
          }}
        >
          <TbSettings />
        </button>
      </div>
      <div className="p-2">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
      <Dialog
        open={showDialog}
        onClose={() => {
          setShowDialog(false);
        }}
      >
        <Dialog.Title>Settings</Dialog.Title>
        <Form onSubmit={onSubmit}>
          <Field
            id="nexusApiKey"
            label="Nexus API Key"
            error={errors.nexusApiKey}
          >
            <Input {...register("nexusApiKey")} />
          </Field>
          <div className="mt-4 flex flex-row justify-between">
            <Button
              intent="secondary"
              onClick={() => {
                setShowDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Dialog>
    </>
  );
}

export const rootRoute = new RootRoute({
  component: Root,
});
