import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CloudUploadIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Color options for the clothing items
const colorOptions = [
  { id: "black", label: "أسود", class: "bg-black" },
  { id: "white", label: "أبيض", class: "bg-white border border-gray-300" },
  { id: "blue", label: "أزرق", class: "bg-blue-500" },
  { id: "red", label: "أحمر", class: "bg-red-500" },
  { id: "green", label: "أخضر", class: "bg-green-500" },
  { id: "yellow", label: "أصفر", class: "bg-yellow-500" },
  { id: "brown", label: "بني", class: "bg-yellow-800" },
  { id: "gray", label: "رمادي", class: "bg-gray-500" },
];

// Season options
const seasonOptions = [
  { id: "summer", label: "صيف" },
  { id: "fall", label: "خريف" },
  { id: "winter", label: "شتاء" },
  { id: "spring", label: "ربيع" },
];

// Category options
const categoryOptions = [
  { id: "shirts", label: "قمصان" },
  { id: "pants", label: "بناطيل" },
  { id: "shoes", label: "أحذية" },
  { id: "jackets", label: "جاكيت" },
  { id: "accessories", label: "اكسسوارات" },
  { id: "other", label: "أخرى" },
];

// Form schema validation
const formSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون اسم القطعة 3 أحرف على الأقل" }),
  category: z.string({ required_error: "يرجى اختيار الفئة" }),
  colors: z.array(z.string()).min(1, { message: "يرجى اختيار لون واحد على الأقل" }),
  seasons: z.array(z.string()).min(1, { message: "يرجى اختيار موسم واحد على الأقل" }),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddClothingForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      colors: [],
      seasons: [],
    },
  });

  const handleColorToggle = (colorId: string) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(selectedColors.filter(id => id !== colorId));
      form.setValue("colors", selectedColors.filter(id => id !== colorId));
    } else {
      const newColors = [...selectedColors, colorId];
      setSelectedColors(newColors);
      form.setValue("colors", newColors);
    }
  };

  const handleSeasonToggle = (seasonId: string) => {
    if (selectedSeasons.includes(seasonId)) {
      setSelectedSeasons(selectedSeasons.filter(id => id !== seasonId));
      form.setValue("seasons", selectedSeasons.filter(id => id !== seasonId));
    } else {
      const newSeasons = [...selectedSeasons, seasonId];
      setSelectedSeasons(newSeasons);
      form.setValue("seasons", newSeasons);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "الملف كبير جداً",
          description: "يجب أن يكون حجم الملف أقل من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("category", values.category);
      values.colors.forEach((color) => {
        formData.append("colors", color);
      });
      values.seasons.forEach((season) => {
        formData.append("seasons", season);
      });
      
      if (values.image) {
        formData.append("image", values.image);
      }

      // Send to backend
      const response = await fetch("/api/wardrobe/clothing", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("فشل في إضافة القطعة");
      }

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة قطعة الملابس إلى خزانتك",
      });

      // Reset form
      form.reset();
      setSelectedColors([]);
      setSelectedSeasons([]);
      setImagePreview(null);

      // Invalidate wardrobe query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe/clothing"] });
      
      // Notify parent component
      onSuccess();
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "فشل في إضافة القطعة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 mb-6 bg-primary bg-opacity-10 py-6 rounded-lg">
      <h2 className="text-lg font-bold mb-4">إضافة قطعة جديدة</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">صورة القطعة</label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-contain border-2 border-primary rounded-lg" 
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => {
                    setImagePreview(null);
                    form.setValue("image", undefined);
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center bg-primary bg-opacity-5">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <div className="flex justify-center mb-2 text-primary">
                    <CloudUploadIcon className="h-10 w-10" />
                  </div>
                  <p className="text-gray-700">اسحب الصورة هنا أو اضغط للاختيار</p>
                  <p className="text-xs text-gray-500 mt-1">(حد أقصى 5 ميجابايت) PNG, JPG</p>
                </label>
              </div>
            )}
          </div>
          
          {/* Item Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">اسم القطعة</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="مثال: قميص أزرق قطني" 
                    {...field} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">الفئة</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full border border-gray-300 rounded-lg bg-white">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Colors */}
          <FormField
            control={form.control}
            name="colors"
            render={() => (
              <FormItem>
                <FormLabel className="font-semibold">الألوان</FormLabel>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        selectedColors.includes(color.id) ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                      onClick={() => handleColorToggle(color.id)}
                      title={color.label}
                    ></button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Seasons */}
          <FormField
            control={form.control}
            name="seasons"
            render={() => (
              <FormItem>
                <FormLabel className="font-semibold">مناسب للمواسم</FormLabel>
                <div className="grid grid-cols-4 gap-2">
                  {seasonOptions.map((season) => (
                    <button
                      key={season.id}
                      type="button"
                      className={`py-2 px-3 rounded-lg text-sm font-semibold ${
                        selectedSeasons.includes(season.id)
                          ? "border border-primary text-primary"
                          : "border border-gray-300"
                      }`}
                      onClick={() => handleSeasonToggle(season.id)}
                    >
                      {season.label}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-white rounded-lg py-6 font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>جاري الإضافة...</span>
              </div>
            ) : (
              "إضافة القطعة"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddClothingForm;
