// Public read-only Helix projections. Never import follower identities or private fields.
export const SECTION_NAMES = ['profile', 'channel', 'stream', 'followers'];
export async function readTwitchSection(api, userId, section) {
  const id = encodeURIComponent(userId);
  if (section === 'channel') {
    const response = await api(`channels?broadcaster_id=${id}`);
    const item = response.data?.find(item => item.broadcaster_id === userId);
    if (!item || typeof item.title !== 'string' || typeof item.game_name !== 'string' || typeof item.broadcaster_language !== 'string' || !Array.isArray(item.tags)) throw new Error('Invalid channel response');
    return { title: item.title, category: item.game_name, language: item.broadcaster_language, tags: item.tags.filter(tag => typeof tag === 'string') };
  }
  if (section === 'stream') {
    const response = await api(`streams?user_id=${id}`);
    if (!Array.isArray(response.data)) throw new Error('Invalid stream response');
    const item = response.data.find(item => item.user_id === userId);
    if (!item && response.data.length) throw new Error('Stream identity mismatch');
    if (item && (typeof item.title !== 'string' || !Number.isInteger(item.viewer_count) || item.viewer_count < 0 || typeof item.started_at !== 'string')) throw new Error('Invalid live stream');
    // Empty successful data means offline; unavailable live-only fields are null, never stale.
    return { live: !!item, title: item?.title ?? null, category: item?.game_name ?? null, viewers: item?.viewer_count ?? null, startedAt: item?.started_at ?? null };
  }
  if (section === 'followers') {
    const response = await api(`channels/followers?broadcaster_id=${id}&first=1`);
    if (!Number.isInteger(response.total) || response.total < 0) throw new Error('Invalid follower count');
    return { total: response.total };
  }
  throw new Error('Unknown section');
}
