export enum LayerName {
    Arena = 'bg',
    Ground = 'ground',
    Default = 'default',
    Foreground = 'fg',
    Active = 'active',
}

export enum LayerSelector {
    Arena = '.' + LayerName.Arena,
    Ground = '.' + LayerName.Ground,
    Default = '.' + LayerName.Default,
    Foreground = '.' + LayerName.Foreground,
    Active = '.' + LayerName.Active,
}
