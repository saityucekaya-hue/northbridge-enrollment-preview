"""Build the Northbridge sample offer used by the local onboarding preview."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "offer-letter-sample.pdf"
INK = colors.HexColor("#1b3440")
GREEN = colors.HexColor("#235b56")
GOLD = colors.HexColor("#b59b67")
MUTED = colors.HexColor("#586b71")
LINE = colors.HexColor("#d9e2df")


def text(page: canvas.Canvas, value: str, x: float, y: float, size: float = 10,
         font: str = "Helvetica", color=INK) -> None:
    page.setFillColor(color)
    page.setFont(font, size)
    page.drawString(x, y, value)


def right(page: canvas.Canvas, value: str, x: float, y: float, size: float = 10,
          font: str = "Helvetica", color=INK) -> None:
    page.setFillColor(color)
    page.setFont(font, size)
    page.drawRightString(x, y, value)


def rule(page: canvas.Canvas, y: float, x1: float = 52, x2: float = 560) -> None:
    page.setStrokeColor(LINE)
    page.setLineWidth(.7)
    page.line(x1, y, x2, y)


def build() -> None:
    page = canvas.Canvas(str(OUTPUT), pagesize=letter)
    page.setTitle("Northbridge University - sample conditional offer")
    page.setAuthor("Northbridge University sample portal")
    width, height = letter

    page.setFillColor(INK)
    page.rect(0, height - 79, width, 79, fill=1, stroke=0)
    page.setStrokeColor(GOLD)
    page.setLineWidth(1.6)
    page.circle(72, height - 39, 20, fill=0, stroke=1)
    page.setFillColor(colors.white)
    page.setFont("Times-Bold", 22)
    page.drawCentredString(72, height - 46, "N")
    text(page, "Northbridge University", 106, height - 38, 19, "Times-Bold", colors.white)
    text(page, "ADMISSIONS OFFICE", 107, height - 56, 8, "Helvetica-Bold", colors.HexColor("#d7e7e1"))

    text(page, "SAMPLE CONDITIONAL OFFER", 52, 683, 8, "Helvetica-Bold", GREEN)
    text(page, "Your offer of a place", 52, 649, 24, "Times-Bold")
    text(page, "For Jordan Lee  |  Autumn 2027", 52, 627, 9, color=MUTED)
    rule(page, 611)

    text(page, "Dear Jordan Lee,", 52, 589, 10, "Helvetica-Bold")
    for y, line in zip((573, 559, 545), (
        "We are pleased to offer you a conditional place to study BSc Computer Science",
        "at Northbridge University. Please read the academic and financial terms below",
        "before deciding whether to accept this offer.",
    )):
        text(page, line, 52, y, 9)

    page.setFillColor(colors.HexColor("#f0f5f1"))
    page.roundRect(52, 371, 508, 149, 7, fill=1, stroke=0)
    text(page, "YOUR COURSE", 68, 500, 8, "Helvetica-Bold", GREEN)
    course = (
        ("Program", "BSc Computer Science"),
        ("Qualification", "Bachelor of Science"),
        ("Study mode and campus", "Full time  |  Main campus"),
        ("Offer condition", "Final transcript required"),
        ("Respond by", "15 June 2027"),
    )
    for index, (label, value) in enumerate(course):
        y = 476 - index * 21
        text(page, label, 68, y, 8, color=MUTED)
        right(page, value, 542, y, 8.2, "Helvetica-Bold")

    text(page, "TUITION AND FEES  |  2027-28", 52, 343, 8, "Helvetica-Bold", GREEN)
    charges = (("Annual tuition", "$24,800"), ("Mandatory fees", "$1,200"))
    for index, (label, value) in enumerate(charges):
        y = 320 - index * 20
        text(page, label, 52, y, 8.5, color=MUTED)
        right(page, value, 560, y, 8.5)
    rule(page, 288)
    text(page, "Estimated annual direct charges", 52, 271, 9, "Helvetica-Bold")
    right(page, "$26,000", 560, 271, 9, "Helvetica-Bold")
    text(page, "Housing, meals, books, and personal expenses are additional.", 52, 250, 7.6, color=MUTED)
    text(page, "Scholarship and aid have not been confirmed or deducted.", 52, 237, 7.6, color=MUTED)
    text(page, "The illustrative enrollment deposit is $500, due 30 June 2027 after acceptance.", 52, 224, 7.6, color=MUTED)

    rule(page, 207)
    text(page, "WHAT HAPPENS NEXT", 52, 186, 8, "Helvetica-Bold", GREEN)
    for y, line in zip((166, 151, 136), (
        "1. Review every term and respond by 15 June 2027.",
        "2. Provide your final transcript for university review.",
        "3. Complete any remaining enrollment tasks after your offer decision.",
    )):
        text(page, line, 52, y, 8.5)

    rule(page, 77)
    text(page, "SAMPLE DOCUMENT FOR DESIGN REVIEW - Not issued by a university and has no legal effect.",
         52, 59, 6.3, color=MUTED)
    right(page, "1 / 1", 560, 59, 6.3, color=MUTED)
    page.showPage()
    page.save()


if __name__ == "__main__":
    build()
