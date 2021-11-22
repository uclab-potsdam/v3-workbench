import { create } from '@storybook/theming/create';

export default create({
    base: 'light',

    colorPrimary: '#675BFB',
    colorSecondary: '#675BFB',

    // UI
    appBg: '#F1F1F6',
    appContentBg: '#F1F1F6',
    appBorderColor: 'transparent',
    appBorderRadius: 0,

    // Typography
    fontBase: '"Inter", sans-serif',
    fontCode: '"Inter", monospace',

    // Text colors
    textColor: '#0e1618',
    textInverseColor: '#F1F1F6',

    // Toolbar default and active colors
    barTextColor: 'black',
    barSelectedColor: 'black',
    barBg: '#F1F1F6',

    // Form colors
    inputBg: 'transparent',
    inputBorder: 'tranpsarent',
    inputTextColor: 'black',
    inputBorderRadius: 0,

    brandTitle: 'V3 Guidelines',
    brandUrl: 'https://uclab.fh-potsdam.de/projects/connect-comprehend-communicate/',
});