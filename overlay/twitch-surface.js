// Rendered Twitch UI. Native leaf reads, scripts and explanations live in the inspector.
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Typography, Button } = G.Atoms;
const TextField = G.TextField;
const languages = ['en','es','pt','fr','de','it','ja','ko','zh','ru','ar','hi','nl','pl','tr','uk','other'];
const names = new Intl.DisplayNames(['en'], { type: 'language' });
const languageName = code => code === 'other' ? 'Other' : (() => { try { return names.of(code) || code; } catch { return code; } })();
function Note({ children, error = false }) {
  return h(Typography, { role: error ? 'alert' : 'status', sx: { fontSize: 12, color: error ? 'error.main' : 'text.secondary', lineHeight: 1.5 } }, children);
}
function ChannelForm({ kernel, values, permissions, selectPath }) {
  const [draft, setDraft] = R.useState({ title: values.title, language: values.language });
  const [dirty, setDirty] = R.useState(false), [busy, setBusy] = R.useState(false), [message, setMessage] = R.useState(null);
  const canEdit = permissions?.canEditChannel === true;
  R.useEffect(() => { if (!dirty) setDraft({ title: values.title, language: values.language }); }, [values.title, values.language, dirty]);
  const update = (field, value) => { setDraft(previous => ({ ...previous, [field]: value })); setDirty(true); setMessage(null); };
  const save = async event => {
    event.preventDefault(); if (!canEdit || !dirty || busy) return;
    setBusy(true); setMessage(null);
    try {
      const body = {};
      if (draft.title !== values.title) body.title = draft.title;
      if (draft.language !== values.language) body.broadcaster_language = draft.language;
      const response = await fetch(`/api/kernels/${encodeURIComponent(kernel.id)}/channel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': permissions.csrf }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save to Twitch.');
      setDirty(false); setMessage({ text: result.warning || 'Saved to Twitch.', error: false });
    } catch (error) { setMessage({ text: error.message, error: true }); }
    finally { setBusy(false); }
  };
  const focus = field => () => selectPath(`twitch.channel.${field}`);
  const fieldProps = { size: 'small', fullWidth: true, variant: 'outlined', disabled: busy, InputLabelProps: { shrink: true } };
  const codes = [...new Set([...languages, values.language].filter(Boolean))];
  return h(Box, { component: 'form', 'aria-label': 'Channel settings', onSubmit: save, sx: { display: 'grid', gap: 1.75, pt: 0.5 } },
    h(Note, null, !permissions ? 'Checking permissions…' : permissions.own ? canEdit ? 'Your channel · editing enabled' : 'Your channel · read access' : 'Public channel · read only'),
    h(TextField, { ...fieldProps, label: 'Stream title', value: draft.title, placeholder: 'No title set', onFocus: focus('title'), onChange: event => update('title', event.target.value), InputProps: { readOnly: !canEdit }, inputProps: { maxLength: 140 }, 'data-channel-title': true }),
    h(TextField, { ...fieldProps, label: 'Category', value: values.category, placeholder: 'No category set', InputProps: { readOnly: true }, onFocus: focus('category') }),
    canEdit ? h(TextField, { ...fieldProps, label: 'Language', value: draft.language, select: true, SelectProps: { native: true }, onFocus: focus('language'), onChange: event => update('language', event.target.value) }, codes.map(code => h('option', { key: code, value: code }, languageName(code))))
      : h(TextField, { ...fieldProps, label: 'Language', value: languageName(values.language) || 'Not set', InputProps: { readOnly: true }, onFocus: focus('language') }),
    h(Typography, { sx: { fontSize: 12, color: 'text.secondary', mb: -1 } }, 'Tags'),
    h(Box, { onClick: focus('tags'), sx: { display: 'flex', flexWrap: 'wrap', gap: 0.75 } }, values.tags.length ? values.tags.map(tag => h(Box, { key: tag, component: 'span', sx: { px: 1, py: 0.25, borderRadius: 1, bgcolor: 'action.hover', fontSize: 12 } }, tag)) : h(Note, null, 'No tags set')),
    canEdit ? h(Box, { sx: { display: 'flex', gap: 1 } },
      h(Button, { type: 'submit', size: 'small', variant: 'contained', disabled: !dirty || busy || (draft.title === values.title && draft.language === values.language) || (draft.title !== values.title && !draft.title.trim()), sx: { textTransform: 'none' } }, busy ? 'Saving…' : 'Save to Twitch'),
      dirty ? h(Button, { type: 'button', size: 'small', disabled: busy, onClick: () => { setDirty(false); setMessage(null); }, sx: { textTransform: 'none' } }, 'Cancel') : null)
      : permissions?.own ? h(Box, null, h(Note, null, 'Allow this app to edit your channel title and language.'),
        h(Button, { component: 'a', href: '/auth/login?manage=1', size: 'small', variant: 'outlined', sx: { mt: 1, textTransform: 'none' } }, 'Authorize channel editing')) : null,
    message ? h(Note, { error: message.error }, message.text) : null);
}
export function TwitchSurface({ kernel, path, selectPath }) {
  const [permissions, setPermissions] = R.useState(null);
  R.useEffect(() => {
    const controller = new AbortController();
    const load = async () => { try { const response = await fetch(`/api/kernels/${encodeURIComponent(kernel.id)}/permissions`, { signal: controller.signal }); if (!response.ok) throw Error(); const result = await response.json(); if (!controller.signal.aborted) setPermissions(result); } catch { if (!controller.signal.aborted) setPermissions({ own: false, canEditChannel: false }); } };
    load(); const timer = setInterval(() => { if (!document.hidden) load(); }, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [kernel.id]);
  const section = path.split('.')[1] || 'stream', state = kernel.sections?.[section];
  const values = Object.fromEntries((kernel.graph?.nodes || []).filter(node => node.path.startsWith(`twitch.${section}.`)).map(node => [node.path.slice(`twitch.${section}.`.length), node.value]));
  const view = children => h(Box, { 'data-twitch-surface': section, sx: { minWidth: 0 } }, children);
  if (state?.status === 'error') return view(h(Note, { error: true }, state.error || 'Twitch data unavailable.'));
  if (section !== 'profile' && state?.status !== 'ready') return view(h(Note, null, 'Loading Twitch data…'));
  if (section === 'channel') return view(h(ChannelForm, { kernel, values, permissions, selectPath }));
  if (section === 'followers') return view(h(Box, { sx: { py: 2, textAlign: 'center' } }, h(Typography, { 'data-follower-count': true, sx: { fontSize: 44, lineHeight: 1.2, fontWeight: 600 } }, values.total.toLocaleString('en')), h(Typography, { sx: { fontSize: 13, color: 'text.secondary' } }, values.total === 1 ? 'Follower' : 'Followers')));
  if (section === 'stream') return view(h(Box, { sx: { display: 'grid', gap: 1.25 } },
    h(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 } }, h(Box, { 'aria-hidden': true, sx: { width: 8, height: 8, borderRadius: '50%', bgcolor: values.live ? 'success.main' : 'text.disabled' } }), h(Typography, { sx: { fontWeight: 600, fontSize: 15 } }, values.live ? 'Live now' : 'Offline')),
    values.live ? h(R.Fragment, null, h(Typography, { sx: { fontSize: 15 } }, values.title), h(Note, null, values.category || 'No category set'), h(Note, null, `${values.viewers.toLocaleString('en')} viewers`), h(Note, null, `Started ${new Date(values.startedAt).toLocaleString()}`)) : null));
  // Public profile facts remain inspectable; the header is their rendered profile.
  return null;
}
