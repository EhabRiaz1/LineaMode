import Link from "next/link";
import { ConsoleHeader } from "@/components/admin/ConsoleHeader";

export const metadata = { title: "Operations Manual · Settings · Admin" };

/* ── Presentational helpers ─────────────────────────────────────────────── */

function Section({
  number,
  title,
  intro,
  children,
}: {
  number: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24 space-y-5" id={`s${number}`}>
      <div className="border-b border-[var(--hairline)] pb-4">
        <p className="text-eyebrow text-ink/45">{number}</p>
        <h2 className="text-h2 text-ink mt-1">{title}</h2>
        {intro && <p className="text-body text-ink/70 mt-2 max-w-2xl">{intro}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[var(--hairline)] bg-stone p-6 space-y-3">
      <h3 className="text-h3 text-ink">{title}</h3>
      <div className="space-y-3 text-body text-ink/75">{children}</div>
    </div>
  );
}

/** Copy an admin can say or send verbatim. */
function Script({ children }: { children: React.ReactNode }) {
  return (
    <figure className="rounded-2xl border border-[var(--hairline)] bg-ink/[0.02] p-4">
      <figcaption className="text-eyebrow text-ink/45 mb-2">Say it like this</figcaption>
      <blockquote className="text-body text-ink/80 italic">{children}</blockquote>
    </figure>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
      {children}
    </p>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 shrink-0 text-label tabular-nums text-ink/40">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-body text-ink/75">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-4">
          <dt className="text-label text-ink/55">{k}</dt>
          <dd className="text-body text-ink/75">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const CONTENTS = [
  ["01", "How the site is put together"],
  ["02", "The contact form, end to end"],
  ["03", "Guiding a customer"],
  ["04", "New admin: first hour"],
  ["05", "Editing page content"],
  ["06", "Media, and why you upload it first"],
  ["07", "Inbox"],
  ["08", "Projects"],
  ["09", "Email"],
  ["10", "Settings you will rarely touch"],
  ["11", "A working rhythm"],
];

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function OperationsManualPage() {
  return (
    <div className="space-y-10">
      <ConsoleHeader
        eyebrow="09 / Settings"
        title="Operations manual"
        subtitle="How the site works, what to tell customers, and everything a new admin needs on day one."
      />

      <nav aria-label="Contents" className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        <p className="text-eyebrow text-ink/45">Contents</p>
        <ol className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {CONTENTS.map(([n, t]) => (
            <li key={n}>
              <a href={`#s${n}`} className="text-body text-ink/70 hover:text-ink hover:underline">
                <span className="text-label tabular-nums text-ink/40 mr-2">{n}</span>
                {t}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 01 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="01"
        title="How the site is put together"
        intro="Two halves. The public site is what customers see. This console is where you change it. Nothing on the public site is edited by touching code."
      >
        <Block title="The public pages">
          <Rows
            rows={[
              ["Home", "The overview: who Lineamode is, the product worlds, and the routes into an enquiry."],
              ["Products", "The catalogue, split into Lifestyle, Athleisure and Sportswear, each with subcategories. Product tiles come from the CMS."],
              ["Capabilities", "What the studio can actually make — fabrics, techniques, quantities."],
              ["About / Founders", "The studio story and the people. Founders is its own page with its own editor."],
              ["Sustainability", "Materials and process commitments."],
              ["Journal", "Long-form articles. Each entry is its own page."],
              ["Lookbook", "Seasonal editorial photography."],
              ["Contact", "The short enquiry form. This is the main way work arrives."],
              ["Start", "A longer, guided intake for people who already know what they want made."],
            ]}
          />
          <p>
            Lookbook and Journal can be shown or hidden from the navigation and homepage
            without deleting anything — see{" "}
            <Link href="/admin/settings/visibility" className="underline hover:text-ink">
              Page visibility
            </Link>
            .
          </p>
        </Block>

        <Block title="Two ways in: Contact vs Start">
          <p>
            <strong>Contact</strong> is short and open-ended. Somebody describes what they
            want in their own words. Most enquiries arrive here.
          </p>
          <p>
            <strong>Start</strong> is a longer questionnaire for people who know their
            route: designing from an idea, designing from scratch, or manufacturing from
            an existing CAD. It collects more detail up front.
          </p>
          <p>
            Both end up in the same place — a customer record and a project you can work
            from. The rest of this manual mostly follows the contact form, because that is
            where most of your work will come from.
          </p>
        </Block>
      </Section>

      {/* 02 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="02"
        title="The contact form, end to end"
        intro="Worth understanding properly, because Inbox and Projects are both just views onto what this form creates."
      >
        <Block title="What the customer fills in">
          <Rows
            rows={[
              ["Title", "Their role — Founder, Design Director, and so on."],
              ["Name", "Required."],
              ["Brand", "Their company or label. Required."],
              ["Email", "Required, and validated."],
              ["Product type", "What they want made. Required."],
              ["MOQ", "Order quantity. Optional — plenty of enquiries leave it blank."],
              ["Brief", "A free-text message, at least a sentence."],
            ]}
          />
          <p>
            There is also an invisible field that humans never see. If it gets filled in,
            the submission is treated as a bot, silently accepted, and thrown away. You
            will never see those, which is the point.
          </p>
        </Block>

        <Block title="What happens the moment they hit send">
          <Steps
            items={[
              <>
                A <strong>customer record</strong> is created — or updated, if that email
                has enquired before. One person, one record, however many times they write.
              </>,
              <>
                A <strong>project</strong> is created with status <strong>draft</strong>{" "}
                and their brief attached.
              </>,
              <>
                The enquiry and a first timeline entry, <em>contact submitted</em>, are
                recorded against the project.
              </>,
              <>
                An <strong>admin notification</strong> goes to everyone on the recipients
                list, with the customer&rsquo;s address as Reply-To — so hitting reply
                writes straight back to them.
              </>,
              <>
                An <strong>auto-reply</strong> goes to the customer confirming their brief
                landed.
              </>,
            ]}
          />
          <p>
            So one submission gives you three things at once: a person in Clients, an item
            in Inbox, and a row in Projects. They are not separate records to reconcile —
            they are one thing seen three ways.
          </p>
        </Block>

        <Note>
          If a customer says they submitted the form and heard nothing, check the Delivery
          log under Email before assuming the form is broken. A bounced or suppressed
          address is far more common than a failed submission — and the project will still
          be sitting in Inbox even when the email failed.
        </Note>
      </Section>

      {/* 03 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="03"
        title="Guiding a customer"
        intro="What to tell people, in plain language, at the moments they usually ask."
      >
        <Block title="They ask where to start">
          <p>
            Point them at Contact unless they already have technical drawings. Start is
            longer and only pays off when they know their route.
          </p>
          <Script>
            If you have a rough idea and want to talk it through, use the contact form on
            the site — a few lines is enough. If you already have CADs or tech packs
            ready, use Start instead; it asks the questions we would otherwise email you
            about.
          </Script>
        </Block>

        <Block title="They ask what happens after they submit">
          <Script>
            You will get an automatic confirmation straight away so you know it arrived.
            A person from the studio reads every brief by hand and comes back within two
            working days — usually with a few sharper questions rather than a quote,
            because the answers change the number.
          </Script>
          <p>
            Two working days is the promise the auto-reply makes. If you cannot hold that,
            change the wording in{" "}
            <Link href="/admin/settings/email" className="underline hover:text-ink">
              Email → Templates
            </Link>{" "}
            rather than quietly missing it.
          </p>
        </Block>

        <Block title="They ask about minimums">
          <p>
            MOQ is optional on the form on purpose — asking too early loses people who
            have not decided. If they raise it, answer honestly and move on.
          </p>
          <Script>
            Leave the quantity blank if you are not sure. It changes the costing, so we
            would rather discuss it once we understand the garment than have you guess now.
          </Script>
        </Block>

        <Block title="They reply to the auto-reply">
          <p>
            That is fine and expected. Mail is sent from a studio address, and replies are
            routed to the inbox on the recipients list. Nothing is lost — but the reply
            arrives as ordinary email, not into this console. If it contains something
            important, put it in the project&rsquo;s Notes so the next person sees it.
          </p>
        </Block>
      </Section>

      {/* 04 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="04"
        title="New admin: first hour"
        intro="Do these in order. It is the shortest route to being useful without breaking anything."
      >
        <Block title="Before you change anything">
          <Steps
            items={[
              "Sign in and set up two-factor authentication under Settings → Security. Do this first.",
              "Open Dashboard, then Inbox, then Projects. Same data, three lenses — get the shape of it.",
              "Open Content → Pages and look at an editor without saving. Every page has one.",
              "Open Content → Media and see what imagery already exists.",
              "Read sections 05 to 08 below. They cover everything you will touch weekly.",
            ]}
          />
        </Block>

        <Block title="The one rule">
          <p>
            <strong>Saving a draft is safe. Publishing is live.</strong> Draft changes are
            invisible to the public and can be discarded. Publishing pushes to the real
            site within moments. When unsure, save a draft and ask someone.
          </p>
        </Block>

        <Block title="What you cannot undo">
          <p>
            Deleting a customer, project or journal entry is permanent — there is no
            recycle bin. Archiving a project keeps it and hides it from your working view,
            which is almost always what you actually want.
          </p>
        </Block>
      </Section>

      {/* 05 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="05"
        title="Editing page content"
        intro="Content → Pages. Home, Products, About, Founders, Capabilities, Contact and Journal each have a purpose-built editor."
      >
        <Block title="Draft, preview, publish">
          <Steps
            items={[
              "Open the page and edit the fields. Nothing is live yet.",
              "Save draft. Your work is stored and the public site is unchanged.",
              "Preview to see the page rendered with your draft applied.",
              "Publish when it reads right. It goes live within moments.",
              "Discard draft throws your unpublished changes away and returns to what is live.",
            ]}
          />
          <p>
            Because a draft persists, you can start an edit on Monday and finish it Friday
            without anything half-written appearing publicly.
          </p>
        </Block>

        <Block title="Journal entries">
          <p>
            Journal entries are separate from pages, under Content → Journal. Each has its
            own slug — the part of the address after <code>/journal/</code>. Set it once
            and leave it: changing a slug after publishing breaks any link anyone has
            shared.
          </p>
          <p>
            Entries have a status. Draft entries are invisible on the public site, so you
            can write ahead and publish when ready.
          </p>
        </Block>

        <Block title="Products">
          <p>
            The Products editor is the most structured one, because the catalogue has real
            shape: three categories, each with subcategories, each holding product tiles.
            A product needs a title and an image; a hover image and description are
            optional.
          </p>
          <p>
            Upload the imagery <em>before</em> you start building the catalogue. Building
            tiles and hunting for images at the same time is where afternoons go.
          </p>
        </Block>
      </Section>

      {/* 06 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="06"
        title="Media, and why you upload it first"
        intro="Content → Media is a shared library. Every editor picks from it. Nothing uploads from inside a page editor."
      >
        <Block title="The habit worth forming">
          <p>
            Upload everything you will need for a job in one pass, then go and build the
            page. The picker only offers what is already in the library, so a missing image
            means abandoning your edit, uploading, and finding your place again.
          </p>
          <p>
            Before a product drop or a new journal piece: gather the images, upload them
            all, write the alt text, <em>then</em> open the editor.
          </p>
        </Block>

        <Block title="What it accepts">
          <Rows
            rows={[
              ["Formats", "Images of any common type, plus MP4 and WebM video."],
              ["Size limit", "25 MB per file. Larger files are rejected before uploading."],
              ["Alt text", "A short description, written at upload time."],
              ["Focal point", "Sets the part of an image that must stay visible when cropped."],
            ]}
          />
        </Block>

        <Block title="Alt text is not optional">
          <p>
            Alt text is what screen readers announce and what search engines read. Write
            what is in the frame, not the file name.
          </p>
          <p>
            Good: <em>Navy heavyweight jersey tee, front view on model</em>. Useless:{" "}
            <em>IMG_4471</em>.
          </p>
        </Block>

        <Block title="Focal point">
          <p>
            The same image is cropped differently on a phone and a desktop. The focal point
            tells the site what must survive the crop. For a garment shot on a model,
            put it on the garment — otherwise a tall phone crop can leave you with a
            beautifully composed photograph of someone&rsquo;s chin.
          </p>
        </Block>
      </Section>

      {/* 07 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="07"
        title="Inbox"
        intro="Your daily triage queue. It shows projects from the last 14 days, newest first."
      >
        <Block title="What it is, precisely">
          <p>
            Inbox is not a separate mailbox. It is a filtered view of Projects — everything
            created in the last fourteen days. A contact form submission appears here
            within seconds of being sent.
          </p>
          <p>
            The <strong>Awaiting review</strong> figure counts projects still at status{" "}
            <strong>draft</strong> — nobody has picked them up yet. Treat that number as
            your to-do count. It should be zero most evenings.
          </p>
        </Block>

        <Note>
          Anything older than 14 days disappears from Inbox. It is not deleted — it is in
          Projects. Inbox is a queue, not an archive, so never use &ldquo;it is gone from
          Inbox&rdquo; to mean &ldquo;it is handled.&rdquo;
        </Note>

        <Block title="Triage">
          <Steps
            items={[
              "Open the project and read the brief.",
              "Move it off draft to reviewing as soon as you pick it up, so nobody duplicates your work.",
              "Reply to the customer by email — hitting reply on the notification goes straight to them.",
              "Write what you promised into Notes. The email thread is not visible here.",
            ]}
          />
        </Block>
      </Section>

      {/* 08 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="08"
        title="Projects"
        intro="The permanent record. Every enquiry ever received, whatever its age."
      >
        <Block title="The statuses and what they mean">
          <Rows
            rows={[
              ["draft", "Just arrived. Nobody has looked at it. This is what the contact form creates."],
              ["reviewing", "Someone has picked it up and is working out what it needs."],
              ["quoted", "A price has gone to the customer. Waiting on them."],
              ["in_progress", "Accepted and in production."],
              ["delivered", "Finished and shipped."],
              ["archived", "Closed, or went nowhere. Kept, but out of the way."],
            ]}
          />
          <p>
            Filter by status to see just your live work. Use <strong>archived</strong>{" "}
            rather than deleting — a dead enquiry is still useful when the same brand comes
            back next season.
          </p>
        </Block>

        <Block title="Inside a project">
          <Rows
            rows={[
              ["Brief", "What the customer actually wrote, plus their details. The source of truth."],
              ["Files", "Anything they attached, or that you added."],
              ["Timeline", "The automatic history — starting with contact submitted."],
              ["Notes", "Your internal record. The customer never sees this."],
            ]}
          />
        </Block>

        <Block title="Notes are the handover">
          <p>
            The single most useful habit in this console. Phone calls, quoted prices,
            promises about timing — none of it exists anywhere the next person can find
            unless you write it in Notes.
          </p>
          <p>
            Assume you will be on holiday when the customer calls back. Write for whoever
            picks it up.
          </p>
        </Block>

        <Block title="Clients">
          <p>
            The Clients page lists people rather than enquiries. Because a customer record
            is matched on email address, a brand that enquires three times is one client
            with three projects — useful for seeing history before you reply.
          </p>
        </Block>
      </Section>

      {/* 09 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="09"
        title="Email"
        intro="Settings → Email. Three tabs: Templates, Recipients, Delivery log."
      >
        <Block title="Templates">
          <p>
            The automatic replies. Edit the subject, greeting, body paragraphs and
            sign-off; the layout is fixed so nothing can break in someone&rsquo;s inbox.
          </p>
          <p>
            Placeholders like <code>{"{{firstName}}"}</code> and <code>{"{{brand}}"}</code>{" "}
            are filled in per customer. A paragraph whose placeholders are all empty
            disappears — which is how the MOQ line vanishes when nobody gave one.
          </p>
          <p>
            The preview is generated by the same code that sends the real email, so it is
            not an approximation. Use <strong>Send test</strong> to see it in a real inbox
            before publishing.
          </p>
        </Block>

        <Block title="Recipients">
          <p>
            Who receives briefs. Add up to ten addresses; the first also receives replies.
            Changes take effect immediately — no deploy, no developer.
          </p>
          <p>
            When someone joins or leaves the team, this is the page to update. If briefs
            stop arriving, check here first.
          </p>
        </Block>

        <Block title="Delivery log">
          <p>
            Every message sent, with its status. <strong>Delivered</strong> and{" "}
            <strong>opened</strong> are good. <strong>Bounced</strong> means the address
            rejected it — usually a typo. <strong>Suppressed</strong> means it bounced
            before and will not be retried until cleared at the mail provider.
          </p>
          <p>
            This is the first place to look whenever someone says they did not receive
            something.
          </p>
        </Block>
      </Section>

      {/* 10 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="10"
        title="Settings you will rarely touch"
        intro="Set once, then left alone — but worth knowing they exist."
      >
        <Block title="Page visibility">
          <p>
            Shows or hides Lookbook and Journal in the navigation and on the homepage.
            Useful when a section is being rebuilt: hide it rather than deleting it.
          </p>
        </Block>
        <Block title="Brand tokens">
          <p>
            The site-wide tagline, the default description search engines and link previews
            show, and the footer line. Individual pages with their own wording keep it —
            these are only the fallbacks.
          </p>
        </Block>
        <Block title="Admins">
          <p>
            Add and remove console accounts. Remove people the day they leave.
          </p>
        </Block>
        <Block title="Security">
          <p>Two-factor authentication. Turn it on for your own account and leave it on.</p>
        </Block>
      </Section>

      {/* 11 ─────────────────────────────────────────────────────────────── */}
      <Section
        number="11"
        title="A working rhythm"
        intro="What this looks like when it is running properly."
      >
        <Block title="Daily">
          <Steps
            items={[
              "Open Inbox. Work Awaiting review down to zero.",
              "Reply to anything from yesterday that is still waiting.",
              "Write up anything you promised, in Notes.",
            ]}
          />
        </Block>
        <Block title="Weekly">
          <Steps
            items={[
              "Move stale projects to their real status — archive what went nowhere.",
              "Skim the Delivery log for bounces.",
              "Upload any imagery you know is coming, before you need it.",
            ]}
          />
        </Block>
        <Block title="When someone joins or leaves">
          <Steps
            items={[
              "Add or remove their console account under Settings → Admins.",
              "Update Settings → Email → Recipients, or briefs go to the wrong people.",
              "Point them at this manual.",
            ]}
          />
        </Block>
      </Section>

      <p className="text-label text-ink/45">
        If something here no longer matches what the console does, the console is right and
        this page needs updating.
      </p>
    </div>
  );
}
