/**
 * Icon layer. Glyphs come from Phosphor (@phosphor-icons/react, ssr entry so
 * both server and client components can render them); the brand mark is the
 * one custom glyph we own. Call sites never import a library directly.
 */
import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowsClockwise,
  ArrowSquareOut,
  BookOpenText,
  CaretDown,
  CaretRight,
  CaretUp,
  Check,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Cpu,
  CurrencyDollar,
  Database,
  FileText,
  GitBranch,
  Lightning,
  List,
  Lock,
  LockOpen,
  MagnifyingGlass,
  Medal,
  Play,
  Pulse,
  Question,
  Shield,
  ShieldCheck,
  Sparkle,
  Stack,
  Target,
  TerminalWindow,
  Users,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";

export type IconProps = { size?: number; className?: string };

type PhosphorGlyph = ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;

function makeIcon(Glyph: PhosphorGlyph) {
  function Icon({ size = 18, className }: IconProps) {
    return <Glyph size={size} className={className} aria-hidden />;
  }
  return Icon;
}

/** The keel mark: a hull section riding on two waterlines. */
export function IconKeelLogo({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 4l8 16 8-16" />
      <path d="M4 9h16" />
      <path d="M7 15h10" />
    </svg>
  );
}

export const IconTerminal = makeIcon(TerminalWindow);
export const IconCheckCircle = makeIcon(CheckCircle);
export const IconXCircle = makeIcon(XCircle);
export const IconAlertTriangle = makeIcon(Warning);
export const IconShield = makeIcon(Shield);
export const IconShieldCheck = makeIcon(ShieldCheck);
export const IconCpu = makeIcon(Cpu);
export const IconLayers = makeIcon(Stack);
export const IconCode = makeIcon(Code);
export const IconGitBranch = makeIcon(GitBranch);
export const IconDatabase = makeIcon(Database);
export const IconBookOpen = makeIcon(BookOpenText);
export const IconArrowRight = makeIcon(ArrowRight);
export const IconChevronRight = makeIcon(CaretRight);
export const IconChevronDown = makeIcon(CaretDown);
export const IconChevronUp = makeIcon(CaretUp);
export const IconPlay = makeIcon(Play);
export const IconRefreshCw = makeIcon(ArrowsClockwise);
export const IconLock = makeIcon(Lock);
export const IconUnlock = makeIcon(LockOpen);
export const IconZap = makeIcon(Lightning);
export const IconAward = makeIcon(Medal);
export const IconTarget = makeIcon(Target);
export const IconDollarSign = makeIcon(CurrencyDollar);
export const IconClock = makeIcon(Clock);
export const IconUsers = makeIcon(Users);
export const IconSparkles = makeIcon(Sparkle);
export const IconExternalLink = makeIcon(ArrowSquareOut);
export const IconMenu = makeIcon(List);
export const IconX = makeIcon(X);
export const IconFileText = makeIcon(FileText);
export const IconActivity = makeIcon(Pulse);
export const IconSearch = makeIcon(MagnifyingGlass);
export const IconHelpCircle = makeIcon(Question);
export const IconCheck = makeIcon(Check);
export const IconCopy = makeIcon(Copy);
