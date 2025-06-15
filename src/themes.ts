import { Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components';

export function getTheme(darkMode: boolean | undefined) {
    return darkMode ? darkTheme : lightTheme;
}

export const darkTheme = webDarkTheme;

// Colors adjusted to a more sepia tone that's easier on the eyes and is similar
// to FFXIV's UI light theme.
export const lightTheme: Theme = {
    ...webLightTheme,
    colorSubtleBackgroundHover: '#d8d2c2',
    colorSubtleBackgroundSelected: '#cec9b9',
    colorNeutralBackground1: '#eee8d5',
    colorNeutralBackground2: '#f2ebd9',
    colorNeutralBackground3: '#fdf6e3',
    colorNeutralBackground1Hover: '#d8d2c2',
    colorNeutralBackground1Pressed: '#fdf6e3',
    colorNeutralBackground1Selected: '#cec9b9',
    colorNeutralBackground3Hover: '#eee8d5',
    colorNeutralBackground3Pressed: '#d8d2c2',
    colorNeutralBackground3Selected: '#cec9b9',
    colorNeutralBackground6: '#d8d2c2',
    colorNeutralBackgroundDisabled: '#fdf6e3',
    colorNeutralStencil1: '#cec9b9',
    colorNeutralStroke1: '#cebfab',
    colorNeutralStroke3: '#cec9b9',
    colorNeutralBackgroundAlpha: 'rgb(253 235 209 / 0.5)',
};
