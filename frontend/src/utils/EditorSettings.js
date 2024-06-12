export class EditorSettings {
    constructor({
                    projectName = 'untitled',
                    projectId = undefined,
                    updated_at = new Date(),
                    projectHeight = 400,
                    projectWidth = 500,
                    fillColor = '#be0303',
                    backgroundColor = '#696969',
                    strokeColor = '#be0303',
                    strokeWidth = 1,
                    strokeOpacityPercent = 100,
                    fontSize = 16,
                    fillOpacityPercent = 100,
                    fontFamily = 'Times New Roman',
                } = {}) {
        this.projectName = projectName;
        this.projectId = projectId;
        this.updated_at = updated_at;
        this.projectHeight = projectHeight;
        this.projectWidth = projectWidth;
        this.fillColor = fillColor;
        this.backgroundColor = backgroundColor;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.strokeOpacityPercent = strokeOpacityPercent;
        this.fontSize = fontSize;
        this.fillOpacityPercent = fillOpacityPercent;
        this.fontFamily = fontFamily;
    }
}