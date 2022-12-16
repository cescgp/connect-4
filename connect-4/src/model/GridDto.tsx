export interface GridBoxDto {
    row: number;
    column: number;
    selected: 'none' | 'yellow' | 'red';
}

export interface GridWinnerCounter {
    up: GridBoxDto[];
    down: GridBoxDto[];
    left: GridBoxDto[];
    right: GridBoxDto[];
    dur: GridBoxDto[];
    dul: GridBoxDto[];
    ddr: GridBoxDto[];
    ddl: GridBoxDto[];
}