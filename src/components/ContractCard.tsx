import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { FileText, Calendar, Users, DollarSign, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';

interface Contract {
  id: string;
  title: string;
  parties: string[];
  status: "pending" | "processing" | "completed" | "error";
  confidenceScore?: number;
  uploadDate: string;
  financialValue?: string;
  processingProgress?: number;
}

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const generatePDF = (contract: Contract) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Contract Summary Report', 20, 30);
  
  // Contract details
  doc.setFontSize(12);
  doc.text(`Contract Title: ${contract.title}`, 20, 50);
  doc.text(`Parties: ${contract.parties.join(', ')}`, 20, 65);
  doc.text(`Status: ${contract.status}`, 20, 80);
  doc.text(`Upload Date: ${new Date(contract.uploadDate).toLocaleDateString()}`, 20, 95);
  
  if (contract.confidenceScore) {
    doc.text(`Confidence Score: ${contract.confidenceScore}%`, 20, 110);
  }
  
  if (contract.financialValue) {
    doc.text(`Financial Value: ${contract.financialValue}`, 20, 125);
  }
  
  // Save the PDF
  doc.save(`${contract.title}-summary.pdf`);
};

export const ContractCard = ({ contract, onClick, className, style }: ContractCardProps) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    generatePDF(contract);
  };

  return (
    <Card 
      className={cn(
        "card-hover gradient-card border-border/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{contract.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 hover:bg-primary/20"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <StatusBadge status={contract.status} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {contract.status === "processing" && contract.processingProgress !== undefined && (
          <ProgressBar progress={contract.processingProgress} showPercentage />
        )}
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{contract.parties.join(", ")}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(contract.uploadDate).toLocaleDateString()}</span>
          </div>
          
          {contract.financialValue && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{contract.financialValue}</span>
            </div>
          )}
        </div>
        
        {contract.confidenceScore !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className={cn(
              "text-sm font-medium",
              contract.confidenceScore >= 90 ? "text-success" :
              contract.confidenceScore >= 70 ? "text-warning" : "text-destructive"
            )}>
              {contract.confidenceScore}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};