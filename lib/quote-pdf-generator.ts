import { jsPDF } from "jspdf"
import { Quote } from "@/types"

export interface CompanyInfo {
  name: string
  address: string
  city: string
  zipCode: string
  country: string
  phone: string
  email: string
  website?: string
  siret?: string
  tva?: string
}

export class QuotePDFGenerator {
  private pdf: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20
  private currentY: number = 20

  // Configuration de l'entreprise (peut être configurée par l'utilisateur)
  private companyInfo: CompanyInfo = {
    name: "AgentIA Commercial",
    address: "123 Avenue de la Innovation",
    city: "Paris",
    zipCode: "75001",
    country: "France",
    phone: "+33 1 23 45 67 89",
    email: "contact@agentia.fr",
    website: "www.agentia.fr",
    siret: "123 456 789 00012",
    tva: "FR12345678901",
  }

  constructor(companyInfo?: Partial<CompanyInfo>) {
    this.pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()

    // Mettre à jour les infos de l'entreprise si fournies
    if (companyInfo) {
      this.companyInfo = { ...this.companyInfo, ...companyInfo }
    }
  }

  /**
   * Génère un PDF professionnel pour un devis
   */
  async generateQuotePDF(quote: Quote): Promise<Blob> {
    // Réinitialiser la position Y
    this.currentY = this.margin

    // Dessiner l'en-tête
    this.drawHeader(quote)

    // Informations du client
    this.drawClientInfo(quote)

    // Tableau des articles
    this.drawItemsTable(quote)

    // Conditions et notes
    this.drawConditions(quote)

    // Footer
    this.drawFooter()

    // Retourner le PDF en tant que Blob
    return this.pdf.output("blob")
  }

  /**
   * Génère et télécharge le PDF
   */
  async downloadQuotePDF(quote: Quote): Promise<void> {
    await this.generateQuotePDF(quote)
    this.pdf.save(`${quote.quoteNumber}_${quote.company}.pdf`)
  }

  /**
   * Dessine l'en-tête du devis
   */
  private drawHeader(quote: Quote): void {
    const primaryColor = quote.color || "#2563eb" // Bleu par défaut

    // Rectangle de fond pour l'en-tête
    this.pdf.setFillColor(primaryColor)
    this.pdf.rect(0, 0, this.pageWidth, 50, "F")

    // Logo (si disponible)
    if (quote.logo) {
      try {
        this.pdf.addImage(quote.logo, "PNG", this.margin, 10, 30, 30)
      } catch (error) {
        console.error("Erreur chargement logo:", error)
      }
    }

    // Nom de l'entreprise
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(22)
    this.pdf.setFont("helvetica", "bold")
    this.pdf.text(this.companyInfo.name, quote.logo ? 60 : this.margin, 20)

    // DEVIS en gros à droite
    this.pdf.setFontSize(28)
    this.pdf.text("DEVIS", this.pageWidth - this.margin, 25, { align: "right" })

    // Numéro de devis
    this.pdf.setFontSize(12)
    this.pdf.setFont("helvetica", "normal")
    this.pdf.text(quote.quoteNumber, this.pageWidth - this.margin, 35, { align: "right" })

    // Informations de l'entreprise (en blanc)
    this.pdf.setFontSize(9)
    const companyInfoLines = [
      `${this.companyInfo.address}`,
      `${this.companyInfo.zipCode} ${this.companyInfo.city}, ${this.companyInfo.country}`,
      `Tél: ${this.companyInfo.phone} | Email: ${this.companyInfo.email}`,
    ]
    if (this.companyInfo.siret) {
      companyInfoLines.push(`SIRET: ${this.companyInfo.siret}`)
    }
    if (this.companyInfo.tva) {
      companyInfoLines.push(`TVA: ${this.companyInfo.tva}`)
    }

    let infoY = 60
    companyInfoLines.forEach((line) => {
      this.pdf.text(line, this.margin, infoY)
      infoY += 4
    })

    this.currentY = Math.max(85, infoY + 5)
  }

  /**
   * Dessine les informations du client
   */
  private drawClientInfo(quote: Quote): void {
    // Titre
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(12)
    this.pdf.setFont("helvetica", "bold")
    this.pdf.text("CLIENT", this.margin, this.currentY)

    this.currentY += 7

    // Informations client
    this.pdf.setFontSize(10)
    this.pdf.setFont("helvetica", "normal")

    const clientLines = [
      quote.company,
      quote.contact,
      quote.email,
    ]
    if (quote.phone) clientLines.push(quote.phone)
    if (quote.address) clientLines.push(quote.address)

    clientLines.forEach((line) => {
      this.pdf.text(line, this.margin, this.currentY)
      this.currentY += 5
    })

    // Dates à droite
    const rightX = this.pageWidth - this.margin
    let dateY = this.currentY - (clientLines.length * 5) + 7

    this.pdf.setFont("helvetica", "bold")
    this.pdf.text("Date d'émission:", rightX - 60, dateY)
    this.pdf.setFont("helvetica", "normal")
    this.pdf.text(this.formatDate(quote.createdAt), rightX, dateY, { align: "right" })

    dateY += 5
    this.pdf.setFont("helvetica", "bold")
    this.pdf.text("Valable jusqu'au:", rightX - 60, dateY)
    this.pdf.setFont("helvetica", "normal")
    this.pdf.text(this.formatDate(quote.expiresAt), rightX, dateY, { align: "right" })

    this.currentY += 10
  }

  /**
   * Dessine le tableau des articles
   */
  private drawItemsTable(quote: Quote): void {
    const tableTop = this.currentY
    const colWidths = {
      description: 85,
      quantity: 25,
      unitPrice: 30,
      taxRate: 20,
      total: 30,
    }

    const startX = this.margin
    let currentX = startX

    // En-tête du tableau
    this.pdf.setFillColor(240, 240, 240)
    this.pdf.rect(startX, tableTop, this.pageWidth - 2 * this.margin, 8, "F")

    this.pdf.setFontSize(9)
    this.pdf.setFont("helvetica", "bold")
    this.pdf.setTextColor(0, 0, 0)

    // Colonnes
    this.pdf.text("DESCRIPTION", startX + 2, tableTop + 5.5)
    currentX += colWidths.description
    this.pdf.text("QTÉ", currentX + 2, tableTop + 5.5)
    currentX += colWidths.quantity
    this.pdf.text("PRIX UNIT.", currentX + 2, tableTop + 5.5)
    currentX += colWidths.unitPrice
    this.pdf.text("TVA", currentX + 2, tableTop + 5.5)
    currentX += colWidths.taxRate
    this.pdf.text("TOTAL HT", currentX + 2, tableTop + 5.5)

    this.currentY = tableTop + 8

    // Lignes du tableau
    this.pdf.setFont("helvetica", "normal")
    this.pdf.setFontSize(9)

    quote.items.forEach((item, index) => {
      const rowHeight = 7
      const rowY = this.currentY

      // Alterner les couleurs de fond
      if (index % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250)
        this.pdf.rect(startX, rowY, this.pageWidth - 2 * this.margin, rowHeight, "F")
      }

      currentX = startX

      // Description (avec wrap si nécessaire)
      const descLines = this.pdf.splitTextToSize(item.description, colWidths.description - 4)
      this.pdf.text(descLines[0], currentX + 2, rowY + 5)

      currentX += colWidths.description
      this.pdf.text(item.quantity.toString(), currentX + 2, rowY + 5)

      currentX += colWidths.quantity
      this.pdf.text(this.formatCurrency(item.unitPrice), currentX + 2, rowY + 5)

      currentX += colWidths.unitPrice
      this.pdf.text(`${item.taxRate || 0}%`, currentX + 2, rowY + 5)

      currentX += colWidths.taxRate
      this.pdf.text(this.formatCurrency(item.total), currentX + 2, rowY + 5)

      this.currentY += rowHeight

      // Vérifier si on doit ajouter une nouvelle page
      if (this.currentY > this.pageHeight - 60) {
        this.pdf.addPage()
        this.currentY = this.margin
      }
    })

    // Ligne de séparation
    this.pdf.setDrawColor(200, 200, 200)
    this.pdf.line(startX, this.currentY, this.pageWidth - this.margin, this.currentY)

    this.currentY += 10

    // Totaux
    const totalsX = this.pageWidth - this.margin - 60
    const labelX = totalsX - 50

    this.pdf.setFont("helvetica", "normal")
    this.pdf.text("Sous-total HT:", labelX, this.currentY)
    this.pdf.text(this.formatCurrency(quote.subtotal), totalsX, this.currentY, { align: "right" })

    this.currentY += 6
    this.pdf.text("TVA:", labelX, this.currentY)
    this.pdf.text(this.formatCurrency(quote.taxAmount), totalsX, this.currentY, { align: "right" })

    this.currentY += 8
    this.pdf.setFont("helvetica", "bold")
    this.pdf.setFontSize(11)
    this.pdf.text("TOTAL TTC:", labelX, this.currentY)
    this.pdf.text(this.formatCurrency(quote.totalAmount), totalsX, this.currentY, { align: "right" })

    this.currentY += 15
  }

  /**
   * Dessine les conditions de paiement et notes
   */
  private drawConditions(quote: Quote): void {
    this.pdf.setFontSize(10)
    this.pdf.setFont("helvetica", "bold")
    this.pdf.text("CONDITIONS DE PAIEMENT", this.margin, this.currentY)

    this.currentY += 6
    this.pdf.setFont("helvetica", "normal")
    this.pdf.setFontSize(9)
    this.pdf.text(quote.paymentTerms, this.margin, this.currentY)

    this.currentY += 6
    this.pdf.text(`Devis valable ${quote.validityDays} jours à compter de la date d'émission.`, this.margin, this.currentY)

    if (quote.notes) {
      this.currentY += 10
      this.pdf.setFont("helvetica", "bold")
      this.pdf.setFontSize(10)
      this.pdf.text("NOTES", this.margin, this.currentY)

      this.currentY += 6
      this.pdf.setFont("helvetica", "normal")
      this.pdf.setFontSize(9)
      const noteLines = this.pdf.splitTextToSize(quote.notes, this.pageWidth - 2 * this.margin)
      noteLines.forEach((line: string) => {
        this.pdf.text(line, this.margin, this.currentY)
        this.currentY += 5
      })
    }
  }

  /**
   * Dessine le footer
   */
  private drawFooter(): void {
    const footerY = this.pageHeight - 20

    this.pdf.setDrawColor(200, 200, 200)
    this.pdf.line(this.margin, footerY, this.pageWidth - this.margin, footerY)

    this.pdf.setFontSize(8)
    this.pdf.setTextColor(100, 100, 100)
    this.pdf.setFont("helvetica", "normal")

    const footerText = `${this.companyInfo.name} - ${this.companyInfo.address}, ${this.companyInfo.zipCode} ${this.companyInfo.city}`
    this.pdf.text(footerText, this.pageWidth / 2, footerY + 5, { align: "center" })

    if (this.companyInfo.website) {
      this.pdf.text(this.companyInfo.website, this.pageWidth / 2, footerY + 10, { align: "center" })
    }

    // Numéro de page
    this.pdf.text(
      `Page ${this.pdf.getCurrentPageInfo().pageNumber}`,
      this.pageWidth - this.margin,
      footerY + 5,
      { align: "right" }
    )
  }

  /**
   * Formate une date en français
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  /**
   * Formate un montant en euros
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  /**
   * Permet de configurer les informations de l'entreprise
   */
  static setCompanyInfo(info: Partial<CompanyInfo>): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("company-info", JSON.stringify(info))
    }
  }

  /**
   * Récupère les informations de l'entreprise depuis localStorage
   */
  static getCompanyInfo(): Partial<CompanyInfo> {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("company-info")
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return {}
        }
      }
    }
    return {}
  }
}

/**
 * Fonction helper pour générer et télécharger un devis
 */
export async function downloadQuote(quote: Quote): Promise<void> {
  const companyInfo = QuotePDFGenerator.getCompanyInfo()
  const generator = new QuotePDFGenerator(companyInfo)
  await generator.downloadQuotePDF(quote)
}

/**
 * Fonction helper pour générer un blob PDF
 */
export async function generateQuoteBlob(quote: Quote): Promise<Blob> {
  const companyInfo = QuotePDFGenerator.getCompanyInfo()
  const generator = new QuotePDFGenerator(companyInfo)
  return await generator.generateQuotePDF(quote)
}
