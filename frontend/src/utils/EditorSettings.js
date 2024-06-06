export class EditorSettings {
    constructor({
                    projectHeight = 400,
                    projectWidth = 500,
                    fillColor = '#be0303',
                    backgroundColor = '#696969',
                    strokeColor = '#be0303',
                    strokeWidth = 1,
                    fontSize = 16,
                    fillStyleEnable = true,
                    fontFamily = 'Times New Roman',
                } = {}) {
        this.projectHeight = projectHeight;
        this.projectWidth = projectWidth;
        this.fillColor = fillColor;
        this.backgroundColor = backgroundColor;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.fontSize = fontSize;
        this.fillStyleEnable = fillStyleEnable;
        this.fontFamily = fontFamily;
    }
}