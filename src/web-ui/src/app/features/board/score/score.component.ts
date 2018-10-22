import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'app-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScoreComponent {
    @Input() public score = 0;
}
