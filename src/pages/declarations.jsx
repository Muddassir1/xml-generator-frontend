import { Helmet } from 'react-helmet-async';
import { DeclarationView } from 'src/sections/declaration/view';

export default function DeclarationPage() {
  return (
    <>
      <Helmet>
        <title> Declarations </title>
      </Helmet>

      <DeclarationView />
    </>
  );
}
