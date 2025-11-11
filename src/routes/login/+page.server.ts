import type { Action } from './$types';
import { fail } from '@sveltejs/kit';

export const actions = {
    default: (async ({ request, url, locals }) => {
        console.log('login action called');
        const formData = await request.formData();
        const provider = formData.get('provider') ?? 'discord';

        if (provider !== 'discord') {
           return fail(400, { error: 'Unsupported provider' });
        }

        const { data, error } = await locals.supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${url.origin}/auth/callback`,
            },
        });

        console.log('OAuth Redirect URL:', data.url);

        if (error) {
            return { error: error.message };
        }

        return {
            status: 303,
            headers: { Location: data.url! }
        };
    }) satisfies Action
};