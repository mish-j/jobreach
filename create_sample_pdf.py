#!/usr/bin/env python3
"""
Create a sample PDF resume for testing
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def create_sample_pdf():
    """Create a sample PDF resume"""
    
    filename = "c:\\Users\\HP\\Desktop\\jobreach\\sample_resume.pdf"
    
    # Create the document
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create the content
    content = []
    
    # Title
    title = Paragraph("John Smith - Software Engineer", styles['Title'])
    content.append(title)
    content.append(Spacer(1, 12))
    
    # Contact info
    contact = Paragraph("Email: john.smith@email.com | Phone: (555) 123-4567", styles['Normal'])
    content.append(contact)
    content.append(Spacer(1, 12))
    
    # Professional Summary
    summary_title = Paragraph("PROFESSIONAL SUMMARY", styles['Heading2'])
    content.append(summary_title)
    
    summary_text = """Experienced Software Engineer with 5+ years of experience in full-stack development, 
    specializing in Python, JavaScript, and cloud technologies. Proven track record of 
    delivering scalable web applications and leading development teams."""
    
    summary = Paragraph(summary_text, styles['Normal'])
    content.append(summary)
    content.append(Spacer(1, 12))
    
    # Technical Skills
    skills_title = Paragraph("TECHNICAL SKILLS", styles['Heading2'])
    content.append(skills_title)
    
    skills_text = """• Programming Languages: Python, JavaScript, Java, TypeScript<br/>
    • Web Frameworks: Django, React, Node.js, Flask<br/>
    • Databases: PostgreSQL, MongoDB, Redis<br/>
    • Cloud Platforms: AWS, Google Cloud Platform<br/>
    • DevOps: Docker, Kubernetes, CI/CD pipelines"""
    
    skills = Paragraph(skills_text, styles['Normal'])
    content.append(skills)
    content.append(Spacer(1, 12))
    
    # Work Experience
    exp_title = Paragraph("WORK EXPERIENCE", styles['Heading2'])
    content.append(exp_title)
    
    exp1_title = Paragraph("Senior Software Engineer | TechCorp Inc. | 2021 - Present", styles['Heading3'])
    content.append(exp1_title)
    
    exp1_text = """• Led development of microservices architecture serving 1M+ users<br/>
    • Implemented automated testing reducing bugs by 40%<br/>
    • Mentored junior developers and conducted code reviews"""
    
    exp1 = Paragraph(exp1_text, styles['Normal'])
    content.append(exp1)
    content.append(Spacer(1, 12))
    
    exp2_title = Paragraph("Software Engineer | StartupXYZ | 2019 - 2021", styles['Heading3'])
    content.append(exp2_title)
    
    exp2_text = """• Developed React-based frontend applications<br/>
    • Optimized database queries improving performance by 60%<br/>
    • Collaborated with cross-functional teams using Agile methodologies"""
    
    exp2 = Paragraph(exp2_text, styles['Normal'])
    content.append(exp2)
    content.append(Spacer(1, 12))
    
    # Education
    edu_title = Paragraph("EDUCATION", styles['Heading2'])
    content.append(edu_title)
    
    edu_text = "Bachelor of Science in Computer Science<br/>University of Technology | 2015 - 2019"
    edu = Paragraph(edu_text, styles['Normal'])
    content.append(edu)
    content.append(Spacer(1, 12))
    
    # Certifications
    cert_title = Paragraph("CERTIFICATIONS", styles['Heading2'])
    content.append(cert_title)
    
    cert_text = "• AWS Certified Solutions Architect<br/>• Google Cloud Professional Developer"
    cert = Paragraph(cert_text, styles['Normal'])
    content.append(cert)
    
    # Build the PDF
    doc.build(content)
    
    print(f"Sample PDF resume created: {filename}")
    return filename

if __name__ == "__main__":
    create_sample_pdf()
