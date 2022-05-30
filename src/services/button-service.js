const baseClass = 'atom-button';

export const buttonService = {
    buttonTypes: [
        'primary',
        'primary-small',
        'light',
        'light-small',
        'cancel',
        'cancel-small'
    ],

    getCssClassesForTypes(value) {
        let classList = '';

        value.split('-').forEach(type => classList += `${baseClass}--${type} `);

        return classList.trim();
    }
}

