"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Json, SupabaseAgent } from "@/types/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { upsertAgent } from "@/app/agents/actions";
import { Textarea } from "./ui/textarea";
import { useTags } from "@/lib/hooks/use-tags";
import TagSelector from "./tag-selector";
import { SelectedTagsProps } from "./drag-drop";
import { FunctionMultiSelect } from "./function-multiselect";

export type AgentSchema = z.infer<typeof AgentSchema>;

// Define the form schema using zod
const AgentSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, {
        message: "Name cannot be empty",
    }),
    description: z.string(),
    prompt: z.string().min(1, {
        message: "Prompt cannot be empty",
    }),
    // tags: z.object({ tags: z.string().array().optional().nullable() }),
    tags: z.string().optional(),
    model: z.string().min(1, {
        message: "Model cannot be empty",
    }),
    functions: z.string().optional(),
    temperature: z.number().min(0, {
        message: "Strictness cannot be below zero",
    }).max(1, {
        message: "Strictness cannot be above one",
    }),
    created_at: z.string().optional(),
});

type AgentDialogProps = {
    title: string;
    action: string;
    open?: boolean;
    agent?: SupabaseAgent;
}

const AgentDialog = ({ title, action, open, agent }: AgentDialogProps) => {
    const [isOpen, setIsOpen] = useState(open ?? false);
    const router = useRouter();
    // @ts-expect-error Type 'string' is not assignable to type '{ color: string; created_at: string; group: string | null; id: number; name: string; value: string; }[]'.ts(2322)
    const [agentTags, setAgentTags] = useState<SelectedTagsProps>({ "agent": agent?.tags ?? [] });

    const defaultValues = {
        name: agent?.name ?? "",
        description: agent?.description ?? "",
        prompt: agent?.prompt ?? "",
        tags: JSON.stringify(agentTags["agent"]) ?? "",
        model: agent?.model ?? "",
        functions: JSON.stringify(agent?.functions) ?? "",
        temperature: agent?.temperature ?? 0.3,
    }

    const form = useForm<z.infer<typeof AgentSchema>>({
        mode: "all",
        resolver: zodResolver(AgentSchema),
        defaultValues: defaultValues
    });
    const { handleSubmit, control, reset, register, formState: { errors, isDirty, isValid, isSubmitting, isSubmitted, isSubmitSuccessful } } = form

    useEffect(() => {
        if (!isSubmitSuccessful) { return }
        reset(defaultValues)
    }, [isSubmitSuccessful])

    const onSubmit = async (agentObj: z.infer<typeof AgentSchema>) => {
        if (!agentObj || !(action === "edit" || action === "add")) {
            console.error("Invalid agent object or action:", agentObj, action);
            throw new Error("Invalid agent object or action");
        };

        let parsedTags;
        try {
            parsedTags = JSON.parse(agentObj.tags || "[]");
            if (!Array.isArray(parsedTags)) throw new Error('Tags are not an array.');
        } catch (error) {
            console.error('Error parsing tags:', error);
            parsedTags = []
        }
        let parsedFunctions;
        try {
            parsedFunctions = JSON.parse(agentObj.functions || "[]");
            if (!Array.isArray(parsedFunctions)) throw new Error('Functions are not an array.');
        } catch (error) {
            console.error('Error parsing functions:', error);
            parsedFunctions = []
        }

        const values = {
            ...agentObj,
            tags: parsedTags,
            functions: parsedFunctions,
            ...(action === "edit" && { id: agent?.id })
        };

        const { data, error } = await upsertAgent(values);

        if (error) {
            console.error("Error upserting agent:", error);
            toast.error("Error upserting agent", { description: error.message });
            setIsOpen(false);
            return;
        }
        setAgentTags({ "agent": [] });
        setIsOpen(false);
        router.refresh();
    };

    return (
        <>
            <Dialog
                open={isOpen}
                defaultOpen={false}
                onOpenChange={() => setIsOpen(!isOpen)}>
                <DialogTrigger asChild>
                    {action === "edit" ? (
                        <DropdownMenuItem
                            onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                        >
                            <Pencil2Icon className="mr-2" />
                            {"Edit"}
                        </DropdownMenuItem>
                    ) : (
                        <Button variant={"default"} onClick={() => setIsOpen(!isOpen)}>
                            {title}
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[35rem] lg:max-w-[55rem] xl:max-w-[75rem]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="grid gap-4">
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <Input
                                                    {...register(
                                                        "name", { setValueAs: (value) => value.trim().toLowerCase() }
                                                    )}
                                                    placeholder={
                                                        "Enter the name of the tag."
                                                    }
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <TagSelector form={form} selectedTags={agentTags} setSelectedTags={setAgentTags} forFile={"agent"} />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="model"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a model" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="gpt-3.5-turbo">GPT 3.5 Turbo</SelectItem>
                                                        <SelectItem value="gpt-4-turbo-preview">GPT 4 Turbo Preview</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FunctionMultiSelect form={form} currentItems={JSON.parse((form.getValues("functions") || "[]"))} />
                                    <FormField
                                        control={control}
                                        name="temperature"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Strictness</FormLabel>
                                                <Input
                                                    {...register("temperature", { setValueAs: (value) => parseFloat(value) })}
                                                    type="number"
                                                    min="0"
                                                    max="1"
                                                    step=".05"
                                                    placeholder={
                                                        "Enter the functions for the agent."
                                                    }
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* <FormField
                                    control={control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Actief</FormLabel>
                                                <FormDescription>Is dit project momenteel actief?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}
                                </div>
                                <div className="grid gap-4">
                                    <FormField
                                        control={control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <Textarea
                                                    {...register("description")}
                                                    placeholder={"Enter the agent description."}
                                                    className="w-full"
                                                    rows={10}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="prompt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prompt</FormLabel>
                                                <Textarea
                                                    {...register("prompt")}
                                                    placeholder={"Enter the instructions for the agent."}
                                                    rows={10}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 py-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        !isValid ||
                                        isSubmitting ||
                                        isSubmitted
                                    }>
                                    {action === "edit"
                                        ? "Edit"
                                        : "Create"}{" "}Agent
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AgentDialog;
