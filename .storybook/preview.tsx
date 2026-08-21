import { I18nProvider } from '../src/providers/I18nProvider';
import '../src/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
