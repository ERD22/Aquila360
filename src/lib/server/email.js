import { Resend } from 'resend';
import { RESEND_API_KEY, FROM_EMAIL, TEST_EMAIL } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function enviarCorreoCotizacion({ cotizacion, cliente }) {
	const totalFormateado = new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN'
	}).format(Number(cotizacion.total));

	const html = `
	<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
		<div style="background: #111827; padding: 24px; border-radius: 12px 12px 0 0;">
			<h1 style="color: #ffffff; margin: 0; font-size: 20px;">Aquila360</h1>
		</div>
		<div style="border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
			<p style="font-size: 16px;">Hola ${cliente.nombre},</p>
			<p style="line-height: 1.6;">
				Es un gusto saludarte. Hemos preparado tu cotización
				<strong>${cotizacion.numero}</strong> y con gusto te la compartimos.
			</p>
			<div style="background: #f9fafb; border-radius: 10px; padding: 18px; margin: 20px 0;">
				<p style="margin: 0; color: #6b7280; font-size: 13px;">Total de la cotización</p>
				<p style="margin: 4px 0 0; font-size: 24px; font-weight: bold;">${totalFormateado}</p>
			</div>
			<p style="line-height: 1.6;">
				Quedamos atentos a cualquier duda o comentario. Será un placer acompañarte en este proyecto.
			</p>
			<p style="margin-top: 24px;">Saludos cordiales,<br /><strong>El equipo de Aquila360</strong></p>
		</div>
		<p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
			Este correo fue enviado automáticamente por Aquila360.
		</p>
	</div>
	`;

	// MVP: sin dominio verificado, Resend solo permite enviar a tu correo de cuenta.
	// En producción (con dominio verificado) sería: to: cliente.correo
	const destinatario = TEST_EMAIL;

	const { data, error } = await resend.emails.send({
		from: `Aquila360 <${FROM_EMAIL}>`,
		to: destinatario,
		subject: `Tu cotización ${cotizacion.numero} está lista`,
		html
	});

	if (error) {
		console.error('Error al enviar el correo de cotización:', error);
		return { ok: false, error };
	}

	return { ok: true, data };
}
