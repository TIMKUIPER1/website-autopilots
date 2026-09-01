import json
import re
from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/i18n/termsContent.ts"
OUTPUT = ROOT / "public/downloads/autopilots-algemene-servicevoorwaarden-v1.6.pdf"

source = SOURCE.read_text(encoding="utf-8").split("const localeMeta:")[0]
sections = []
for title, paragraphs in re.findall(r'\{title:("(?:[^"\\]|\\.)*"),paragraphs:\[(.*?)\]\}', source, re.S):
    sections.append((json.loads(title), json.loads("[" + paragraphs + "]")))
if len(sections) != 15:
    raise RuntimeError(f"Expected 15 terms sections, found {len(sections)}")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
brown, black, muted, soft = HexColor("#9f3826"), HexColor("#111111"), HexColor("#656565"), HexColor("#f5f5f2")
title_style = ParagraphStyle("Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=27, leading=31, textColor=black, alignment=TA_CENTER, spaceAfter=12)
subtitle_style = ParagraphStyle("Subtitle", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16, textColor=muted, alignment=TA_CENTER)
h2_style = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=black, spaceBefore=10, spaceAfter=8, keepWithNext=True)
body_style = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=14, textColor=muted, spaceAfter=8)
notice_style = ParagraphStyle("Notice", parent=body_style, fontName="Helvetica-Bold", textColor=brown, borderColor=brown, borderWidth=0.8, borderPadding=10, backColor=soft, spaceBefore=8, spaceAfter=18)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(HexColor("#ddddda")); canvas.line(20*mm, 15*mm, 190*mm, 15*mm)
    canvas.setFont("Helvetica", 7.5); canvas.setFillColor(muted)
    canvas.drawString(20*mm, 10*mm, "Autopilots AI Agency LLC - Algemene servicevoorwaarden - versie 1.6")
    canvas.drawRightString(190*mm, 10*mm, f"Pagina {doc.page}")
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=20*mm, bottomMargin=22*mm, title="Algemene servicevoorwaarden Autopilots", author="Autopilots AI Agency LLC")
story = [Spacer(1, 18*mm), Paragraph("AUTOPILOTS", ParagraphStyle("Brand", parent=subtitle_style, fontName="Helvetica-Bold", fontSize=12, textColor=brown, spaceAfter=18)), Paragraph("Algemene servicevoorwaarden", title_style), Paragraph("Autopilots AI Agency LLC", subtitle_style), Spacer(1, 8*mm), Paragraph("B2B-servicevoorwaarden voor AI-medewerkers, software, implementatie en support.", subtitle_style), Spacer(1, 12*mm), Paragraph("Versie 1.6 &nbsp;&nbsp;|&nbsp;&nbsp; Laatst bijgewerkt: 1 september 2026", subtitle_style), Spacer(1, 14*mm), Paragraph("De Nederlandse versie is juridisch leidend. Deze voorwaarden vormen samen met de bestelling, het voorstel of de Statement of Work de overeenkomst.", notice_style), Spacer(1, 22*mm), Paragraph("Autopilots AI Agency LLC<br/>131 Continental Dr, Suite 305<br/>Newark, Delaware 19713, Verenigde Staten<br/>info@auto-pilots.io", subtitle_style), PageBreak()]
for title, paragraphs in sections:
    story.append(Paragraph(title, h2_style))
    for paragraph in paragraphs:
        story.append(Paragraph(paragraph.replace("&", "&amp;"), body_style))
    story.append(Spacer(1, 3*mm))
story += [Spacer(1, 8*mm), Paragraph("Einde algemene servicevoorwaarden - versie 1.6", notice_style)]
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
