import { createClient } from '@supabase/supabase-js';
import { Job } from '../types/Job';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseService {
  // Admin Settings Methods
  async getGeminiApiKey(): Promise<string> {
    try {
      console.log('🔍 Fetching Gemini API key from Supabase...');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'gemini_api_key')
        .single();

      if (error) {
        console.error('❌ Error fetching API key:', error);
        
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          console.log('📝 Creating default API key record...');
          await this.setGeminiApiKey('');
          return '';
        }
        
        return '';
      }

      console.log('✅ API key fetched successfully');
      return data?.setting_value || '';
    } catch (error) {
      console.error('❌ Error in getGeminiApiKey:', error);
      return '';
    }
  }

  async setGeminiApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('💾 Saving Gemini API key to Supabase...');
      
      // First try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('admin_settings')
        .update({
          setting_value: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'gemini_api_key')
        .select();

      if (updateError) {
        console.log('🔄 Update failed, trying upsert...', updateError);
        
        // If update fails, try upsert
        const { data: upsertData, error: upsertError } = await supabase
          .from('admin_settings')
          .upsert({
            setting_key: 'gemini_api_key',
            setting_value: apiKey,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_key'
          })
          .select();

        if (upsertError) {
          console.error('❌ Upsert failed:', upsertError);
          return false;
        }
        
        console.log('✅ API key upserted successfully:', upsertData);
      } else {
        console.log('✅ API key updated successfully:', updateData);
      }

      return true;
    } catch (error) {
      console.error('❌ Error in setGeminiApiKey:', error);
      return false;
    }
  }

  // Jobs Methods
  async getAllJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      return data.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        experience: job.experience,
        salary: job.salary || '',
        description: job.description,
        skills: job.skills || [],
        postedDate: job.posted_date,
        source: job.source,
        type: job.type,
        remote: job.remote,
        applyUrl: job.apply_url
      }));
    } catch (error) {
      console.error('Error in getAllJobs:', error);
      return [];
    }
  }

  async addJob(job: Omit<Job, 'id'>): Promise<boolean> {
    try {
      console.log('🔄 Adding job to Supabase:', job.title, 'at', job.company);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: job.title,
          company: job.company,
          location: job.location,
          experience: job.experience,
          salary: job.salary,
          description: job.description,
          skills: job.skills,
          posted_date: job.postedDate,
          source: job.source,
          type: job.type,
          remote: job.remote,
          apply_url: job.applyUrl
        })
        .select();

      if (error) {
        console.error('❌ Error adding job to Supabase:', error);
        return false;
      }

      console.log('✅ Job added successfully to Supabase:', data);
      return true;
    } catch (error) {
      console.error('❌ Error in addJob:', error);
      return false;
    }
  }

  async addJobsBatch(jobs: Omit<Job, 'id'>[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    console.log(`🚀 Starting batch upload of ${jobs.length} jobs...`);

    for (const job of jobs) {
      try {
        const success = await this.addJob(job);
        if (success) {
          successCount++;
        } else {
          failedCount++;
          errors.push(`Failed to add: ${job.title} at ${job.company}`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`Error adding: ${job.title} at ${job.company} - ${error}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Batch upload complete: ${successCount} success, ${failedCount} failed`);

    return {
      success: successCount,
      failed: failedCount,
      errors
    };
  }

  async updateJob(job: Job): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          location: job.location,
          experience: job.experience,
          salary: job.salary,
          description: job.description,
          skills: job.skills,
          posted_date: job.postedDate,
          source: job.source,
          type: job.type,
          remote: job.remote,
          apply_url: job.applyUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) {
        console.error('Error updating job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateJob:', error);
      return false;
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJob:', error);
      return false;
    }
  }

  // Real-time subscriptions
  subscribeToJobs(callback: (jobs: Job[]) => void) {
    const subscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          // Refetch jobs when changes occur
          this.getAllJobs().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  subscribeToApiKey(callback: (apiKey: string) => void) {
    const subscription = supabase
      .channel('api_key_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'admin_settings', filter: 'setting_key=eq.gemini_api_key' },
        () => {
          // Refetch API key when it changes
          this.getGeminiApiKey().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  // Debug method to check admin settings table
  async debugAdminSettings(): Promise<void> {
    try {
      console.log('🔍 Debugging admin settings...');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) {
        console.error('❌ Debug error:', error);
      } else {
        console.log('📊 Admin settings data:', data);
      }
    } catch (error) {
      console.error('❌ Debug exception:', error);
    }
  }
}

export const supabaseService = new SupabaseService();