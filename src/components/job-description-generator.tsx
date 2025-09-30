'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2 } from 'lucide-react';

import {
  generateJobDescription,
  GenerateJobDescriptionInput,
} from '@/ai/flows/generate-job-description';
import { GenerateJobDescriptionInputSchema } from '@/ai/flows/generate-job-description';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function JobDescriptionGenerator() {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateJobDescriptionInput>({
    resolver: zodResolver(GenerateJobDescriptionInputSchema),
    defaultValues: {
      role: '',
      department: '',
      requiredSkills: '',
    },
  });

  async function onSubmit(values: GenerateJobDescriptionInput) {
    setIsLoading(true);
    setJobDescription('');
    try {
      const result = await generateJobDescription(values);
      setJobDescription(result.jobDescription);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Description',
        description: 'There was an issue generating the job description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Job Description Generator</CardTitle>
              <CardDescription>
                Fill in the details below to generate a job description using AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., React, Node.js, TypeScript, SQL"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      Provide a comma-separated list of skills.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Description
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Description</CardTitle>
          <CardDescription>The AI-generated job description will appear below.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {jobDescription && (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-secondary rounded-lg whitespace-pre-wrap">
              {jobDescription}
            </div>
          )}
          {!isLoading && !jobDescription && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Your generated content will be here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
