import { APP_NAME } from '../../utils/constants.js';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="gd-app-footer d-flex flex-wrap align-items-center justify-content-between gd-gap-2">
      <span>
        © {year} {APP_NAME}. Built with the GitHub REST API.
      </span>
      <a
        href="https://docs.github.com/en/rest"
        target="_blank"
        rel="noreferrer"
        className="gd-text-muted"
      >
        API Documentation
      </a>
    </footer>
  );
}

export default Footer;
