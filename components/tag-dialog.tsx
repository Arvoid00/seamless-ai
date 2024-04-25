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
import { createTag, upsertTag } from "@/app/tags/actions";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { SupabaseTag } from "@/types/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TAG_COLORS, useTags } from "@/lib/hooks/use-tags";

export type TagSchema = z.infer<typeof TagSchema>;

// Define the form schema using zod
const TagSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, {
        message: "Name cannot be empty",
    }),
    value: z.string().min(1, {
        message: "Value cannot be empty",
    }),
    group: z.string().min(1, {
        message: "Group cannot be empty",
    }),
    color: z.string().min(1, {
        message: "Color cannot be empty",
    }),
    created_at: z.string().optional(),
});

type TagDialogProps = {
    title: string;
    action: string;
    open?: boolean;
    tag?: SupabaseTag;
}

const TagDialog = ({ title, action, open, tag }: TagDialogProps) => {
    const [isOpen, setIsOpen] = useState(open ?? false);
    const router = useRouter();
    const { setTags } = useTags();

    const defaultValues = {
        name: tag?.name ?? "",
        value: tag?.value ?? "",
        group: tag?.group ?? "",
        color: tag?.color ?? "",
    }

    const form = useForm<z.infer<typeof TagSchema>>({
        mode: "all",
        resolver: zodResolver(TagSchema),
        defaultValues: defaultValues,
    });
    const { handleSubmit, control, reset, register, formState: { isDirty, isValid, isSubmitting, isSubmitted, isSubmitSuccessful } } = form

    useEffect(() => {
        if (!isSubmitSuccessful) { return }
        reset(defaultValues)
    }, [isSubmitSuccessful])

    const onSubmit = async (tagObj: z.infer<typeof TagSchema>) => {
        if (tagObj && (action === "edit" || action === "add")) {
            let values =
                action === "edit"
                    ? { id: tag?.id, ...tagObj }
                    : tagObj
            // console.log(values);

            const { data, error } = await upsertTag(values);

            setTags((tags) => [...tags, data]);
            setIsOpen(false);
            router.refresh();
        }
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
                <DialogContent className="sm:max-w-[45rem]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <Input
                                                {...register(
                                                    "name"
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
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value</FormLabel>
                                            <Input
                                                {...register("value")}
                                                placeholder={
                                                    "The generated value of the tag."
                                                }
                                                value={form.getValues("name").replace(/\s+/g, "-").toLowerCase()}
                                                readOnly={true}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="group"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Group
                                            </FormLabel>
                                            <Input
                                                type="text"
                                                {...register(
                                                    "group"
                                                )}
                                                placeholder={
                                                    "Enter the tag group in which the tag belongs."
                                                }
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a color" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TAG_COLORS.map((color) => (
                                                        <SelectItem key={color} value={color}>
                                                            <div
                                                                className="h-4 w-4 rounded-full"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                            <div className="grid gap-4 py-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        !isDirty ||
                                        !isValid ||
                                        isSubmitting ||
                                        isSubmitted
                                    }>
                                    {action === "edit"
                                        ? "Edit"
                                        : "Create"}{" "}Tag
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default TagDialog;
