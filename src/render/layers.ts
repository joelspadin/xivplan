export enum LayerName {
    Ground = 'ground',
    Default = 'default',
    Foreground = 'fg',
    Active = 'active',
    Controls = 'control',
}

export enum LayerSelector {
    Ground = '.' + LayerName.Ground,
    Default = '.' + LayerName.Default,
    Foreground = '.' + LayerName.Foreground,
    Active = '.' + LayerName.Active,
    Controls = '.' + LayerName.Controls,
}
