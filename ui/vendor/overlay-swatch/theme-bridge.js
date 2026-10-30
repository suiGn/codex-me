// Read the actual palette variables published by the existing GUI Theme provider.
// Observe palette changes rather than mounting a second theme/context instance.
export function useThemePalette() {
  const React = window.React, gui = window.GUI.useThemeContext();
  const read = () => getComputedStyle(document.documentElement).getPropertyValue('--mui-palette-primary-main').trim() || '#90caf9';
  const [primary, setPrimary] = React.useState(read);
  React.useLayoutEffect(() => {
    const update = () => setPrimary(read());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [gui.themeId, gui.mode]);
  return { palette: { primary: { main: primary }, mode: gui.mode } };
}
