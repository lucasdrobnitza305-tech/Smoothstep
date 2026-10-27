export type Activity = { isBusy: boolean; label: string }
export type Step = { id: string; title: string; status: 'pending' | 'in_progress' | 'completed' }
export type Made = { title: string; url: string }

declare module 'claude-code' {
  interface PluginState {
    'smoothstep-ueberblick': {
      activity: Shaped<Activity>
      steps: Shaped<Step[]>
      made: Shaped<Made[]>
      changed: Shaped<string[]>
    }
  }
}
