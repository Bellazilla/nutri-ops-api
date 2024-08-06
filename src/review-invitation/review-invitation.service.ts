import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TrustpilotService } from 'trustpilot/trustpilot.service';
import { PrestaOrdersService } from 'presta_orders/presta_orders.service';
import { ReviewInvitation, ReviewType } from './review-invitation.entity';
import { WmsService } from 'wms/wms.service';
import { getPastDateFromToday } from 'utils/getPastDateFromToday';

type EmailVariables = {
  firstname?: string;
  serviceReviewLink?: string;
  defaultReviewLink?: string;
  productReviewLink?: string;
  products?: any[];
};

type EmailFrom = {
  email: string;
  name: string;
};

type EmailTo = {
  email: string;
  name: string;
};

type Email = {
  subject: string;
  from: EmailFrom;
  to: EmailTo[];
  templateId: number;
  variables: EmailVariables;
};
@Injectable()
export class ReviewInvitationService {
  constructor(
    @InjectRepository(ReviewInvitation)
    private readonly reviewInvitationRepository: Repository<ReviewInvitation>,
    private readonly wmsService: WmsService,
    private readonly trustPilotService: TrustpilotService,
    private readonly prestaOrdersService: PrestaOrdersService,
  ) {}

  async sendEmail(email: Email) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mailjet = require('node-mailjet').apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_API_SECRET,
    );

    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: email.from,
          To: email.to.map((t) => ({
            Email: t.email,
            Name: t.name,
          })),
          TemplateID: email.templateId,
          TemplateLanguage: true,
          Subject: email.subject,
          Variables: email.variables,
        },
      ],
    });

    request
      .then(() => {
        // console.log(result.body);
      })
      .catch((err: any) => {
        console.log(err.statusCode);
      });
  }

  async getReviewInvitationByReferenceIdAndType(
    referenceId: string,
    review_Type: ReviewType,
  ) {
    return await this.reviewInvitationRepository.findOne({
      where: { referenceId, review_type: review_Type },
    });
  }

  async createReviewInvitation(
    referenceId: string,
    invitationLink: string,
    reviewType: ReviewType,
  ) {
    const reviewInvitation = new ReviewInvitation();
    reviewInvitation.referenceId = referenceId;
    reviewInvitation.invitation_link = invitationLink;
    reviewInvitation.review_type = reviewType;
    return await this.reviewInvitationRepository.save(reviewInvitation);
  }

  async sendProductReviewLinks() {
    await this.trustPilotService.getAccessToken();
    const orderCreatedTimeFrom = getPastDateFromToday({
      numberOfDaysToGoBack: 35,
    });
    const thirtyDaysBackFromToday = getPastDateFromToday({
      numberOfDaysToGoBack: 30,
    });
    const orderStatusFrom = 450;
    const orderStatusTo = 450;
    const orders = await this.wmsService.queryOrders({
      orderCreatedTimeFrom,
      orderStatusFrom,
      orderStatusTo,
    });

    const filteredOrders = orders.filter((order: any) => {
      const deliveryDate = new Date(order.orderInfo.deliveryDate);
      const fromDate = new Date(thirtyDaysBackFromToday);
      return deliveryDate < fromDate;
    });

    for (const order of filteredOrders) {
      const customerEmail = order.consignee.advanced?.emailNotification?.value;

      const existingReviewInvitation =
        await this.getReviewInvitationByReferenceIdAndType(
          order.reference,
          ReviewType.Product,
        );
      if (!existingReviewInvitation) {
        const reference = order.orderInfo.referenceNumber;
        const email = customerEmail;
        const name = order.consignee.name.split(' ')[0];

        const productReferences = order.orderLines.map(
          (ol: any) => ol.article.articleNumber,
        );

        const trustPilotProductsResponse =
          await this.trustPilotService.getProducts(productReferences);
        const productIds = (
          trustPilotProductsResponse as unknown as any
        )?.data?.map((p: any) => p.id);
        const productReviewLinkResponse =
          await this.trustPilotService.generateProductsReviewLink(
            productIds,
            email,
            name,
            reference,
          );
        const products = (
          trustPilotProductsResponse as unknown as any
        ).data.map((p: any) => ({
          imageUrl: p.imageLink,
          title: p.title,
        }));

        const productReviewLink = (productReviewLinkResponse as unknown as any)
          ?.reviewUrl;

        await this.sendEmail({
          subject: 'Hur vill du betygsätta detta?',
          from: { email: 'kontak@nutri.se', name: 'Nutri.se' },
          to: [{ email, name }],
          templateId: 5427799,
          variables: {
            firstname: name,
            productReviewLink: productReviewLink,
            products: products as any,
          },
        });
        await this.createReviewInvitation(
          reference,
          productReviewLink,
          ReviewType.Product,
        );
      }
    }
    return 'successfully processed';
  }

  async sendProductReviewLinks_deprecated() {
    await this.trustPilotService.getAccessToken();
    const ordersResponse =
      await this.prestaOrdersService.getRecordsFromMonthAgo();
    const orders = ordersResponse.data;
    for (const order of orders) {
      const existingReviewInvitation =
        await this.getReviewInvitationByReferenceIdAndType(
          order.reference,
          ReviewType.Product,
        );
      if (!existingReviewInvitation) {
        const reference = order.reference;
        const email = order.customer.email;
        const name = order.customer.firstname;
        const productReferences = order.orderDetails.map(
          (od) => od.product_reference,
        );

        const trustPilotProductsResponse =
          await this.trustPilotService.getProducts(productReferences);
        const productIds = (
          trustPilotProductsResponse as unknown as any
        )?.data?.map((p: any) => p.id);
        const productReviewLinkResponse =
          await this.trustPilotService.generateProductsReviewLink(
            productIds,
            email,
            name,
            reference,
          );
        const products = (
          trustPilotProductsResponse as unknown as any
        ).data.map((p: any) => ({
          imageUrl: p.imageLink,
          title: p.title,
        }));

        const productReviewLink = (productReviewLinkResponse as unknown as any)
          ?.reviewUrl;
        await this.sendEmail({
          subject: 'Hur vill du betygsätta detta?',
          from: { email: 'kontak@nutri.se', name: 'Nutri.se' },
          to: [{ email, name }],
          templateId: 5427799,
          variables: {
            firstname: name,
            productReviewLink: productReviewLink,
            products: products as any,
          },
        });
        await this.createReviewInvitation(
          reference,
          productReviewLink,
          ReviewType.Product,
        );
      }
    }
    return 'successfully processed';
  }

  async sendServiceReviewLinks() {
    await this.trustPilotService.getAccessToken();
    const orderCreatedTimeFrom = getPastDateFromToday({
      numberOfDaysToGoBack: 14,
    });
    const tenDaysBackFromToday = getPastDateFromToday({
      numberOfDaysToGoBack: 10,
    });
    const orderStatusFrom = 450;
    const orderStatusTo = 450;
    const orders = await this.wmsService.queryOrders({
      orderCreatedTimeFrom,
      orderStatusFrom,
      orderStatusTo,
    });

    const filteredOrders = orders.filter((order: any) => {
      const deliveryDate = new Date(order.orderInfo.deliveryDate);
      const fromDate = new Date(tenDaysBackFromToday);
      return deliveryDate < fromDate;
    });

    for (const order of filteredOrders) {
      const existingReviewInvitation =
        await this.getReviewInvitationByReferenceIdAndType(
          order.orderInfo.referenceNumber,
          ReviewType.Service,
        );
      const customerEmail = order.consignee.advanced?.emailNotification?.value;
      if (!existingReviewInvitation && customerEmail.length) {
        const reference = order.orderInfo.referenceNumber;
        const email = customerEmail;
        const name = order.consignee.name.split(' ')[0];
        const serviceReviewLinkResponse =
          await this.trustPilotService.generateServiceReviewLink(
            email,
            name,
            reference,
          );
        // console.info((serviceReviewLinkResponse as unknown as any)?.url);
        const serviceReviewLink = (serviceReviewLinkResponse as unknown as any)
          ?.url;
        await this.sendEmail({
          subject: '⭐ ⭐ ⭐ ⭐ ⭐  Hur många stjärnor ger du nutri.se?',
          from: { email: 'kontak@nutri.se', name: 'Nutri.se' },
          to: [{ email, name }],
          templateId: 5397132,
          variables: {
            firstname: name,
            serviceReviewLink: serviceReviewLink,
            defaultReviewLink: 'https://yua28pzneqy.typeform.com/to/Xo1XFcOI',
          },
        });
        await this.createReviewInvitation(
          reference,
          serviceReviewLink,
          ReviewType.Service,
        );
      }
    }

    return 'successfully processed';
  }

  async sendServiceReviewLinks_deprecated() {
    await this.trustPilotService.getAccessToken();
    const ordersResponse =
      await this.prestaOrdersService.getRecordsFromTenDaysAgo();

    const orders = ordersResponse.data;
    for (const order of orders) {
      const existingReviewInvitation =
        await this.getReviewInvitationByReferenceIdAndType(
          order.reference,
          ReviewType.Service,
        );
      if (!existingReviewInvitation) {
        const reference = order.reference;
        const email = order.customer.email;
        const name = order.customer.firstname;
        const serviceReviewLinkResponse =
          await this.trustPilotService.generateServiceReviewLink(
            email,
            name,
            reference,
          );
        // console.info((serviceReviewLinkResponse as unknown as any)?.url);
        const serviceReviewLink = (serviceReviewLinkResponse as unknown as any)
          ?.url;
        await this.sendEmail({
          subject: '⭐ ⭐ ⭐ ⭐ ⭐  Hur många stjärnor ger du nutri.se?',
          from: { email: 'kontak@nutri.se', name: 'Nutri.se' },
          to: [{ email, name }],
          templateId: 5397132,
          variables: {
            firstname: name,
            serviceReviewLink: serviceReviewLink,
            defaultReviewLink: 'https://yua28pzneqy.typeform.com/to/Xo1XFcOI',
          },
        });
        await this.createReviewInvitation(
          reference,
          serviceReviewLink,
          ReviewType.Service,
        );
      }
    }

    return 'successfully processed';
  }
}
