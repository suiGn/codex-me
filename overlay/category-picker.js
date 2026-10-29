const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button } = G.Atoms;

// Public Twitch category names are selectable; the write uses their verified IDs.
export function CategoryPicker({ kernelId, value, onChange, onFocus, focused, disabled }) {
  const [query, setQuery] = R.useState(''), [open, setOpen] = R.useState(false);
  const [options, setOptions] = R.useState([]), [searching, setSearching] = R.useState(false), [error, setError] = R.useState('');
  const ref = R.useRef(null), input = R.useRef(null), id = R.useId();
  R.useEffect(() => {
    if (!open || query.trim().length < 2) { setOptions([]); setSearching(false); setError(''); return; }
    const controller = new AbortController();
    setOptions([]); setSearching(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/kernels/${encodeURIComponent(kernelId)}/categories?${new URLSearchParams({ query: query.trim() })}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Could not search Twitch.');
        if (!controller.signal.aborted) setOptions(data.data);
      } catch (error) { if (!controller.signal.aborted) setError(error.message); }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, open, kernelId]);
  const pick = option => { onChange(option.name, option.id); setOpen(false); setQuery(''); input.current?.focus(); };
  const show = open && query.trim().length >= 2;
  return h(Box, { ref, onBlur: event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); } },
    h(G.TextField, { size: 'small', fullWidth: true, variant: 'outlined', label: 'Category', focused, value, disabled, inputRef: input, placeholder: 'Search Twitch categories', InputLabelProps: { shrink: true },
      inputProps: { role: 'combobox', 'aria-autocomplete': 'list', 'aria-controls': id, 'aria-expanded': show, maxLength: 100 },
      onFocus: () => { onFocus(); },
      onChange: event => { onChange(event.target.value, event.target.value.trim() ? null : '0'); setQuery(event.target.value); setOpen(true); },
      onKeyDown: event => { if (event.key === 'Escape') setOpen(false); if (event.key === 'ArrowDown' && show && options.length) { event.preventDefault(); ref.current.querySelector('[role="option"]')?.focus(); } },
      error: !!error, helperText: error || (show && searching ? 'Searching…' : show && !options.length ? 'No categories found' : undefined) }),
    show && options.length ? h(Box, { id, role: 'listbox', 'aria-label': 'Twitch categories', sx: { mt: 0.5, maxHeight: 160, overflowY: 'auto', borderLeft: 2, borderColor: 'divider' } }, options.map((option, index) =>
      h(Button, { key: option.id, type: 'button', role: 'option', 'aria-selected': false, onClick: () => pick(option), onKeyDown: event => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); input.current?.focus(); }
        if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); const next = index + (event.key === 'ArrowDown' ? 1 : -1); if (next < 0) input.current?.focus(); else ref.current.querySelectorAll('[role="option"]')[Math.min(options.length - 1, next)]?.focus(); }
      }, sx: { display: 'block', width: '100%', textAlign: 'left', justifyContent: 'flex-start', px: 1, py: 0.5, fontSize: 12, color: 'text.primary', textTransform: 'none' } }, option.name))) : null);
}
