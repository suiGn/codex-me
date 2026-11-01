const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button } = G.Atoms;

// Only verified Twitch results can supply a category ID. Picking is a local draft.
export function CategoryPicker({ kernelId, value, onChange, onFocus, focused, disabled }) {
  const [query, setQuery] = R.useState(''), [open, setOpen] = R.useState(false);
  const [options, setOptions] = R.useState([]), [searching, setSearching] = R.useState(false), [error, setError] = R.useState('');
  const [position, setPosition] = R.useState(null);
  const ref = R.useRef(null), list = R.useRef(null), input = R.useRef(null), id = R.useId();
  const term = query.trim(), show = open && term.length !== 1;
  R.useEffect(() => {
    if (!show) { setOptions([]); setSearching(false); setError(''); return; }
    const controller = new AbortController();
    setOptions([]); setSearching(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/kernels/${encodeURIComponent(kernelId)}/categories?${new URLSearchParams({ query: term })}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.data)) throw Error(data.error || 'Could not load Twitch categories.');
        if (!controller.signal.aborted) setOptions(data.data);
      } catch (error) { if (!controller.signal.aborted) setError(error.message); }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, term ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [term, show, kernelId]);
  R.useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const box = input.current?.getBoundingClientRect(); if (!box) return;
      const below = window.innerHeight - box.bottom - 12, above = box.top - 12;
      const height = Math.max(48, Math.min(180, Math.max(below, above)));
      setPosition({ left: box.left, width: box.width, maxHeight: height, ...(below >= Math.min(180, above) ? { top: box.bottom + 6 } : { bottom: window.innerHeight - box.top + 6 }) });
    };
    const outside = event => { if (!ref.current?.contains(event.target) && !list.current?.contains(event.target)) setOpen(false); };
    update(); window.addEventListener('resize', update); document.addEventListener('scroll', update, true); document.addEventListener('pointerdown', outside, true);
    return () => { window.removeEventListener('resize', update); document.removeEventListener('scroll', update, true); document.removeEventListener('pointerdown', outside, true); };
  }, [open]);
  const blur = event => { if (!ref.current?.contains(event.relatedTarget) && !list.current?.contains(event.relatedTarget)) setOpen(false); };
  const close = () => { input.current?.focus(); setOpen(false); };
  const pick = option => { onChange(option.name, option.id); setQuery(''); close(); };
  const message = error || (searching ? 'Loading Twitch categories…' : !options.length ? 'No categories found' : '');
  return h(Box, { ref, onBlur: blur },
    h(G.TextField, { size: 'small', fullWidth: true, variant: 'outlined', label: 'Category', focused, value, disabled, inputRef: input, placeholder: 'Search Twitch categories', InputLabelProps: { shrink: true },
      inputProps: { role: 'combobox', 'aria-autocomplete': 'list', 'aria-controls': open ? id : undefined, 'aria-expanded': open, maxLength: 100 },
      onFocus: () => { onFocus(); setOpen(true); }, onClick: () => setOpen(true),
      onChange: event => { onChange(event.target.value, event.target.value.trim() ? null : '0'); setQuery(event.target.value); setOpen(true); },
      onKeyDown: event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); } if (event.key === 'ArrowDown') { event.preventDefault(); if (!open) setOpen(true); else list.current?.querySelector('[role="option"]')?.focus(); } },
      error: !!error, helperText: open && term.length === 1 ? 'Type at least 2 characters to search' : undefined }),
    open && position ? ReactDOM.createPortal(h(Box, { ref: list, id, role: 'listbox', 'aria-label': term ? 'Twitch categories' : 'Popular Twitch categories', onBlur: blur,
      sx: { position: 'fixed', ...position, zIndex: 1600, overflowY: 'auto', bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 6, py: .5 } },
      term.length === 1 ? h(Box, { role: 'status', sx: { px: 1, py: .5, fontSize: 12 } }, 'Type at least 2 characters to search') : message ? h(Box, { role: error ? 'alert' : 'status', sx: { px: 1, py: .5, fontSize: 12 } }, message) : options.map((option, index) =>
        h(Button, { key: option.id, type: 'button', role: 'option', 'aria-selected': option.name === value, onClick: () => pick(option), onKeyDown: event => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
          if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); const next = index + (event.key === 'ArrowDown' ? 1 : -1); if (next < 0) input.current?.focus(); else list.current?.querySelectorAll('[role="option"]')[Math.min(options.length - 1, next)]?.focus(); }
        }, sx: { display: 'block', width: '100%', textAlign: 'left', justifyContent: 'flex-start', px: 1, py: .5, fontSize: 12, color: 'text.primary', textTransform: 'none' } }, option.name))), document.body) : null);
}
