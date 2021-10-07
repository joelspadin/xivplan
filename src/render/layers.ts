export enum LayerName {
    Arena = 'bg',
    Ground = 'ground',
    Default = 'default',
    Tether = 'fg',
    Active = 'active',
}

export enum LayerSelector {
    Arena = '.' + LayerName.Arena,
    Ground = '.' + LayerName.Ground,
    Default = '.' + LayerName.Default,
    Tether = '.' + LayerName.Tether,
    Active = '.' + LayerName.Active,
}
