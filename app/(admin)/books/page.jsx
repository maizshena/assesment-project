import DashboardLayout from '@/app/LayoutAdmin';
import { BooksContent } from './BooksContent'; 

   export default function BooksPage() {
     return (
       <DashboardLayout>
         <BooksContent />
       </DashboardLayout>
     );
   }