export interface GridRowDto {
    columns: GridColumnDto[];
}

export interface GridColumnDto {
    positionY: number;
    positionX: number;
    selected: 'none' | 'yellow' | 'red';
}