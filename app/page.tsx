"use client";

import { Loader2Icon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { useState } from "react";

const formSchema = z.object({
  databaseUrl: z.string().url(),
  url: z.string().url(),

  openaiKey: z.string(),
  notionKey: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const crawl = async (values: FormSchema) => {
  const res = await fetch("/api/crawl", {
    method: "POST",
    body: JSON.stringify(values),
  });
  const data = await res.json();
  return data;
};

export default function Home() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      databaseUrl: "",
      url: "",
      openaiKey: "",
      notionKey: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await crawl(values);
      toast.success("Added the page to your DB!", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        "Could not add the page. Please check console for the error log",
        {
          position: "bottom-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 py-8 px-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border rounded-md p-8 w-full sm:max-w-md lg:max-w-lg xl:max-w-2xl"
        >
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Notion AutoDB
          </h1>

          <FormField
            control={form.control}
            name="databaseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Database URL</FormLabel>
                <FormDescription>
                  Expand the Database and paste the URL
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="https://www.notion.so/<YOUR-DB-ID>"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormDescription>The website you want to add</FormDescription>
                <FormControl>
                  <Input placeholder="https://www.your-page.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openaiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenAI API Key</FormLabel>
                <FormDescription>
                  You can get your key{" "}
                  <Link
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    className="underline"
                  >
                    here
                  </Link>
                </FormDescription>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notionKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notion API Key</FormLabel>
                <FormDescription>
                  You can get your key{" "}
                  <Link
                    href="https://developers.notion.com/docs/create-a-notion-integration#getting-started"
                    target="_blank"
                    className="underline"
                  >
                    here
                  </Link>
                </FormDescription>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2Icon className="animate-spin mr-2" /> Processing
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>

      <Toaster />
    </main>
  );
}
