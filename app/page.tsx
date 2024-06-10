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
import { Separator } from "@/components/ui/separator";

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
      <div className="w-full sm:max-w-md lg:max-w-lg xl:max-w-2xl flex flex-col gap-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 rounded-md "
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-center">
                Notion AutoDB
              </h1>
              <p className="text-muted-foreground text-sm text-center">
                Automatically Extract and Add data from websites to your Notion
                Database
              </p>
            </div>

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

        <footer className="text-center w-full border-t flex sm:flex-row flex-col justify-between items-center pt-4 gap-2">
          <p>
            Powered by{" "}
            <Link
              href="https://jina.ai/"
              target="_blank"
              className="font-bold transition hover:text-black/50"
            >
              Jina.ai
            </Link>{" "}
            and{" "}
            <Link
              href="https://js.useinstructor.com/"
              target="_blank"
              className="font-bold transition hover:text-black/50"
            >
              Instructor (JS)
            </Link>
            . Created by{" "}
            <Link
              href="https://www.linkedin.com/in/13point5/"
              target="_blank"
              className="font-bold transition hover:text-black/50"
            >
              Sriraam
            </Link>
            .
          </p>

          <div className="flex space-x-4">
            <Link
              href="https://twitter.com/27upon2"
              target="_blank"
              className="group"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.093 4.093 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.615 11.615 0 0 0 6.29 1.84" />
              </svg>
            </Link>
            <Link
              href="https://github.com/13point5/notion-auto-db"
              target="_blank"
              className="group"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </Link>
          </div>
        </footer>

        <Toaster />
      </div>
    </main>
  );
}
