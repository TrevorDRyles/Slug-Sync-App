// ./test-utils/render.tsx
import { render as testingLibraryRender } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
// Import your theme object
// import { theme } from '../src/theme';

export function render(ui) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }) => (
      <MantineProvider>{children}</MantineProvider>
    ),
  });
}
