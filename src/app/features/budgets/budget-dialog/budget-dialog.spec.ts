import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetDialog } from './budget-dialog';

describe('BudgetDialog', () => {
  let component: BudgetDialog;
  let fixture: ComponentFixture<BudgetDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
