import Link from "next/link";
export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Daymark home">
      <span className="brand-mark" aria-hidden="true">
        ✳
      </span>
      <span>
        daymark<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
