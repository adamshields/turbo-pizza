import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#workspace">Skip to workspace</a>
    <div class="app-shell">
      <aside class="sidebar" aria-label="Workspace navigation">
        <a routerLink="/vendors" class="brand"><span class="brand-mark">V</span>VendorDesk<span class="brand-dot">.</span></a>
        <p class="sidebar-label">WORKSPACE</p>
        <a routerLink="/vendors" class="nav-link" aria-current="page"><span class="nav-symbol" aria-hidden="true">&#9638;</span>Vendors<span class="nav-indicator"></span></a>
        <div class="sidebar-note"><span class="small-label">LIVE CODING WORKSPACE</span><h2>Small app.<br />Real engineering.</h2><p>Explore, reproduce, improve.<br />Start with CANDIDATE.md.</p></div>
        <div class="sidebar-footer"><span class="avatar">VD</span><div><strong>Operations team</strong><span>Interview environment</span></div></div>
      </aside>
      <div class="main-shell">
        <header class="topbar"><span>Workspace <span class="crumb">/</span> <strong>Vendor management</strong></span><span class="environment"><span aria-hidden="true"></span>Local demo data</span></header>
        <main id="workspace"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class App {}
