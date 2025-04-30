'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { updateEstimateItem, updateEstimate, finalizeEstimate } from '@/lib/estimateService';
import { AlertCircle, Save, Trash2, Plus, DollarSign, CheckCircle2, FileCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  material_price: number;
  labor_price: number;
  confidence: number;
  sort_order: number;
  material_id?: string | null;
}

interface Estimate {
  id: string;
  name: string;
  description?: string;
  is_draft: boolean;
  total_material: number;
  total_labor: number;
  items: EstimateItem[];
  created_at: string;
  updated_at: string;
}

interface EstimateGridProps {
  estimateId: string;
  initialEstimate: Estimate;
}

export function EstimateGrid({ estimateId, initialEstimate }: EstimateGridProps) {
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate>(initialEstimate);
  const [items, setItems] = useState<EstimateItem[]>(initialEstimate.items);
  const [loading, setLoading] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  
  // Recalculate totals when items change
  useEffect(() => {
    const totalMaterial = items.reduce(
      (sum, item) => sum + (item.material_price || 0) * (item.quantity || 1),
      0
    );
    const totalLabor = items.reduce(
      (sum, item) => sum + (item.labor_price || 0) * (item.quantity || 1),
      0
    );
    
    setEstimate(prev => ({
      ...prev,
      total_material: totalMaterial,
      total_labor: totalLabor,
    }));
    
    setSaved(false);
  }, [items]);
  
  const handleItemChange = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleAddItem = () => {
    const newItem: EstimateItem = {
      id: `temp-${Date.now()}`, // Will be replaced by actual ID after saving
      description: '',
      quantity: 1,
      unit: 'EACH',
      material_price: 0,
      labor_price: 0,
      confidence: 1,
      sort_order: items.length,
    };
    
    setItems([...items, newItem]);
  };
  
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First update the estimate
      await updateEstimate(estimateId, {
        name: estimate.name,
        description: estimate.description,
        total_material: estimate.total_material,
        total_labor: estimate.total_labor,
      });
      
      // Then update each item
      for (const item of items) {
        await updateEstimateItem(item.id, {
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          material_price: item.material_price,
          labor_price: item.labor_price,
        });
      }
      
      setSaved(true);
      router.refresh(); // Refresh the page to get the latest data
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while saving');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinalize = async () => {
    try {
      // First save all changes
      await handleSave();
      
      setFinalizeLoading(true);
      setError(null);
      
      // Then finalize the estimate
      await finalizeEstimate(estimateId);
      
      // Update the local state
      setEstimate(prev => ({
        ...prev,
        is_draft: false,
      }));
      
      router.refresh(); // Refresh the page to get the latest data
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while finalizing');
      }
    } finally {
      setFinalizeLoading(false);
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };
  
  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'High confidence';
    if (confidence >= 0.7) return 'Medium confidence';
    return 'Low confidence';
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Estimate Details</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
              disabled={loading || saved}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {estimate.is_draft && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleFinalize}
                disabled={finalizeLoading || !saved}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {finalizeLoading ? 'Finalizing...' : 'Finalize Estimate'}
              </Button>
            )}
            
            {!estimate.is_draft && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Finalized
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Estimate Name</Label>
              <Input 
                id="name" 
                value={estimate.name}
                onChange={(e) => setEstimate({...estimate, name: e.target.value})}
                className="mt-1"
                disabled={!estimate.is_draft}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={estimate.description || ''}
                onChange={(e) => setEstimate({...estimate, description: e.target.value})}
                className="mt-1"
                disabled={!estimate.is_draft}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500">Material Total</div>
              <div className="text-2xl font-bold">${estimate.total_material.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500">Labor Total</div>
              <div className="text-2xl font-bold">${estimate.total_labor.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500">Grand Total</div>
              <div className="text-2xl font-bold">${(estimate.total_material + estimate.total_labor).toFixed(2)}</div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-md flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Line Items</CardTitle>
          {estimate.is_draft && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium">Description</th>
                  <th className="py-2 px-3 text-right font-medium w-24">Quantity</th>
                  <th className="py-2 px-3 text-left font-medium w-24">Unit</th>
                  <th className="py-2 px-3 text-right font-medium w-32">Material Price</th>
                  <th className="py-2 px-3 text-right font-medium w-32">Labor Price</th>
                  <th className="py-2 px-3 text-right font-medium w-32">Extended Price</th>
                  {estimate.is_draft && (
                    <th className="py-2 px-3 text-center font-medium w-16">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <Input 
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="text-sm"
                          disabled={!estimate.is_draft}
                        />
                        {item.confidence < 1 && (
                          <div className="mt-1 flex items-center">
                            <Badge 
                              variant="outline"
                              className={`text-xs inline-flex items-center ${getConfidenceColor(item.confidence)}`}
                            >
                              {Math.round(item.confidence * 100)}% - {getConfidenceText(item.confidence)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-right text-sm"
                        disabled={!estimate.is_draft}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input 
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="text-sm"
                        disabled={!estimate.is_draft}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="relative">
                        <DollarSign className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input 
                          type="number"
                          value={item.material_price}
                          onChange={(e) => handleItemChange(item.id, 'material_price', parseFloat(e.target.value) || 0)}
                          className="pl-8 text-right text-sm"
                          disabled={!estimate.is_draft}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="relative">
                        <DollarSign className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input 
                          type="number"
                          value={item.labor_price}
                          onChange={(e) => handleItemChange(item.id, 'labor_price', parseFloat(e.target.value) || 0)}
                          className="pl-8 text-right text-sm"
                          disabled={!estimate.is_draft}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      ${((item.material_price + item.labor_price) * item.quantity).toFixed(2)}
                    </td>
                    {estimate.is_draft && (
                      <td className="py-2 px-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={!estimate.is_draft}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={estimate.is_draft ? 7 : 6} className="py-8 text-center text-gray-500">
                      No items yet. Click &quot;Add Item&quot; to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {estimate.is_draft && (
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={loading || saved}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={handleFinalize}
                disabled={finalizeLoading || !saved}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {finalizeLoading ? 'Finalizing...' : 'Finalize Estimate'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}